# Virtual Try-On Roadmap

This document captures the long-term plan for rendering wardrobe items on real people or mannequins.

## 1. Current In-App Visualizer
- Canvas-based mannequin overlay renders on-device (no extra services).
- Uses wardrobe item images layered onto a neutral silhouette (`public/templates/mannequin.png`).
- Ideal for rapid previews; relies on consistent aspect ratios.

### Next Enhancements
- Auto-scale uploads when saving wardrobe items (target aspect ratio 3:4).
- Allow manual adjustments (rotate/scale/offset) per item and persist overrides.
- Export outfit PNG/GIF snapshots for sharing.

### Latest Work
- Generated deterministic mannequin silhouette asset via `scripts/generate-mannequin.mjs` and shipped it under `public/templates/mannequin.png`.
- Updated `OutfitVisualizer` so wardrobe pieces scale against the shared template instead of ad-hoc rounded divs.
- Exposed `/api/virtual-try-on` endpoint, forwarding garments to configurable managed VTON providers while caching results in local storage.
- Added `/api/virtual-try-on/generative`, which leverages OpenAI `gpt-image-1` plus a vision-powered descriptor to synthesize concept renders directly from user reference photos.
- Integrated Google Vertex AI Imagen Virtual Try-On (Preview 08-04) when `VTON_PROVIDER_NAME=vertex`, minting OAuth tokens server-side and streaming prediction results back into local storage.

## 2. AI-Assisted Try-On (Self-Hosted)
We can add a dedicated inference microservice that runs a virtual try-on diffusion model (e.g. [TryOnDiffusion](https://arxiv.org/abs/2310.13806) or [DressCode](https://github.com/aimagelab/dresscode)).

### High-Level Architecture
1. **Service**: Python API (FastAPI) with GPU acceleration (NVIDIA >= 12 GB VRAM recommended).
2. **Inputs**: (a) clean garment image; (b) person reference photo / mannequin; (c) segmentation mask (auto-generated via U^2-Net).
3. **Pipeline**:
   - Detect pose & keypoints using OpenPose/MediaPipe.
   - Generate clothing mask & resize garment.
   - Run diffusion model to synthesize garment onto target body.
   - Return 512×512 PNG + metadata (confidence, segmentation mask).
4. **Integration**: Next.js calls the microservice via `/api/virtual-try-on`, stores results in object storage (e.g. Azure Blob/S3).
5. **Caching**: Deduplicate inference by garmentId/profileId/date to avoid redundant GPU runs.

### Operational Checklist
- Containerize service (CUDA base image + `diffusers`, `xformers`).
- Add queue + worker (Redis + RQ) to batch requests.
- Introduce feature flag in app to toggle VTON per tenant.
- Ensure user consent and privacy for uploaded body images.

## 3. Managed API Providers
If GPU hosting is undesirable:
- **Physna / Vue.ai / ZMO.AI** provide REST APIs for virtual try-on.
- Requires sending garment + model images; billed per render.
- Integration steps: obtain API key, build webhook for async completion, map provider-specific garment categories to our schema.
- Add retry & fallback to mannequin overlay if provider fails.

### OpenAI Generative Mode (Concept Renders)
- Endpoint: `/api/virtual-try-on/generative`.
- Flow: use GPT-4o-mini to describe the user photo, then call `gpt-image-1` to render a styled concept shot.
- Pros: no extra infrastructure, fast experimentation for marketing visuals.
- Cons: does not guarantee pixel-accurate garment transfer; treat as a creative preview alongside true VTON outputs.

### Google Vertex AI (Warp-Based VTON)
- Endpoint: `/api/virtual-try-on` with `VTON_PROVIDER_NAME=vertex`.
- Requirements: `GCP_PROJECT_ID`, Vertex-enabled service account credentials, model ID `imagen-virtual-try-on-preview-08-04` in `us-central1`.
- Flow: convert wardrobe + model photos to base64, call Vertex `predict`, persist returned composite via the shared storage helper.
- Use `providerHints.vertexInstance` / `providerHints.vertexParameters` to tweak future Vertex API options without code changes.

## 4. Security & Compliance
- Store raw user photos encrypted at rest; restrict access via signed URLs.
- Offer automatic purge policy (e.g. delete original person photos after inferencing).
- Log inference requests with audit identifiers but never raw images.
- Update privacy policy to cover AI processing and third-party service usage.

## 5. Timeline Proposal
| Milestone | Scope | Estimate |
|-----------|-------|----------|
| M1 | Finish mannequin overlay polish & export | 1 week |
| M2 | PoC self-hosted try-on (single GPU) | 3 weeks |
| M3 | Productionize service + queue + monitoring | 4 weeks |
| M4 | Optional: integrate managed API fallback | 2 weeks |

## 6. Open Questions
- Do we need photorealistic faces or anonymized mannequins?
- Where will GPU workloads run (Azure NV-series vs. local)?
- Should users be able to choose their own body reference photos?
- License compatibility for target diffusion models?

Track decisions here before implementation to avoid rework.
