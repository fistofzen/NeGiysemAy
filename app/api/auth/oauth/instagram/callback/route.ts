import { NextResponse } from "next/server";

// Instagram OAuth callback handler
export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=no_code`);
  }

  try {
    // TODO: Exchange code for access token
    // TODO: Get user info from Instagram
    // TODO: Create or find user in database
    // TODO: Create session
    
    // For now, redirect to login with message
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?message=Instagram OAuth henüz aktif değil`
    );
  } catch (err) {
    console.error("Instagram OAuth callback error:", err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=oauth_failed`
    );
  }
};
