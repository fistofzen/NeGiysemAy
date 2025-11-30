import "server-only";

import { GoogleAuth } from "google-auth-library";

const DEFAULT_SCOPES = ["https://www.googleapis.com/auth/cloud-platform"];

const getProjectId = () => {
  const value = process.env.GCP_PROJECT_ID ?? process.env.GOOGLE_CLOUD_PROJECT;
  if (!value) {
    throw new Error("GCP_PROJECT_ID is required for Vertex AI virtual try-on integration");
  }
  return value;
};

const getLocation = () => process.env.VERTEX_LOCATION ?? "us-central1";

const getPublisher = () => process.env.VERTEX_PUBLISHER ?? "google";

const getModel = () => process.env.VERTEX_VIRTUAL_TRYON_MODEL ?? "virtual-try-on-preview-08-04";

export const buildVtonEndpoint = () => {
  const projectId = getProjectId();
  const location = getLocation();
  const publisher = getPublisher();
  const model = getModel();
  return `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/${publisher}/models/${model}:predict`;
};

let cachedAuth: GoogleAuth | null = null;

export const getGoogleAuth = () => {
  if (!cachedAuth) {
    cachedAuth = new GoogleAuth({ scopes: DEFAULT_SCOPES });
  }
  return cachedAuth;
};

export const getAccessToken = async () => {
  const auth = getGoogleAuth();
  const client = await auth.getClient();
  const accessTokenResponse = await client.getAccessToken();
  if (!accessTokenResponse?.token) {
    throw new Error("Failed to retrieve Google access token");
  }
  return accessTokenResponse.token;
};
