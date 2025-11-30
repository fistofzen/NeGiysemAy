import { NextResponse } from "next/server";

type OAuthProvider = "google" | "instagram";

export const GET = async (
  request: Request,
  { params }: { params: { provider: OAuthProvider } }
) => {
  const { provider } = params;

  // TODO: Implement OAuth flow
  // For Google: https://developers.google.com/identity/protocols/oauth2
  // For Instagram: https://developers.facebook.com/docs/instagram-basic-display-api/getting-started

  if (provider === "google") {
    // Google OAuth flow will be implemented here
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/google/callback`;
    
    if (!clientId) {
      return NextResponse.json(
        { message: "Google OAuth yapılandırılmamış" },
        { status: 500 }
      );
    }

    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.set("client_id", clientId);
    googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile");
    googleAuthUrl.searchParams.set("access_type", "offline");

    return NextResponse.redirect(googleAuthUrl.toString());
  }

  if (provider === "instagram") {
    // Instagram OAuth flow will be implemented here
    const clientId = process.env.INSTAGRAM_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/instagram/callback`;

    if (!clientId) {
      return NextResponse.json(
        { message: "Instagram OAuth yapılandırılmamış" },
        { status: 500 }
      );
    }

    const instagramAuthUrl = new URL("https://api.instagram.com/oauth/authorize");
    instagramAuthUrl.searchParams.set("client_id", clientId);
    instagramAuthUrl.searchParams.set("redirect_uri", redirectUri);
    instagramAuthUrl.searchParams.set("scope", "user_profile,user_media");
    instagramAuthUrl.searchParams.set("response_type", "code");

    return NextResponse.redirect(instagramAuthUrl.toString());
  }

  return NextResponse.json(
    { message: "Geçersiz OAuth sağlayıcısı" },
    { status: 400 }
  );
};
