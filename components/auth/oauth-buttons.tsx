'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";

type OAuthProvider = "google" | "instagram";

export const OAuthButtons = () => {
  const [loading, setLoading] = useState<OAuthProvider | null>(null);

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    setLoading(provider);
    try {
      // OAuth flow will be implemented
      window.location.href = `/api/auth/oauth/${provider}`;
    } catch (error) {
      console.error(`${provider} login failed:`, error);
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-500">veya</span>
        </div>
      </div>

      <div className="grid gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleOAuthLogin("google")}
          disabled={loading !== null}
          className="w-full"
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {loading === "google" ? "Yükleniyor..." : "Google ile devam et"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => handleOAuthLogin("instagram")}
          disabled={loading !== null}
          className="w-full"
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="5.4" fill="url(#instagram-gradient)" />
            <defs>
              <linearGradient id="instagram-gradient" x1="0" y1="24" x2="24" y2="0">
                <stop offset="0%" stopColor="#FD5949" />
                <stop offset="50%" stopColor="#D6249F" />
                <stop offset="100%" stopColor="#285AEB" />
              </linearGradient>
            </defs>
            <path
              fill="white"
              d="M12 7.082a4.918 4.918 0 1 0 0 9.836 4.918 4.918 0 0 0 0-9.836zm0 8.11a3.192 3.192 0 1 1 0-6.384 3.192 3.192 0 0 1 0 6.383zM16.965 6.855a1.148 1.148 0 1 1-2.296 0 1.148 1.148 0 0 1 2.296 0zM20.361 8.01a5.682 5.682 0 0 0-1.551-4.022A5.72 5.72 0 0 0 14.788 2.437c-1.586-.09-6.339-.09-7.925 0a5.713 5.713 0 0 0-4.022 1.547A5.704 5.704 0 0 0 1.29 8.006c-.09 1.586-.09 6.339 0 7.925a5.682 5.682 0 0 0 1.551 4.022 5.725 5.725 0 0 0 4.022 1.551c1.586.09 6.339.09 7.925 0a5.682 5.682 0 0 0 4.022-1.551 5.72 5.72 0 0 0 1.551-4.022c.09-1.586.09-6.335 0-7.921zm-2.049 9.63a3.24 3.24 0 0 1-1.824 1.825c-1.264.501-4.262.386-5.661.386-1.398 0-4.4.111-5.66-.386a3.24 3.24 0 0 1-1.825-1.825c-.501-1.264-.386-4.262-.386-5.66 0-1.399-.111-4.4.386-5.661a3.24 3.24 0 0 1 1.824-1.825c1.264-.501 4.262-.386 5.661-.386 1.398 0 4.4-.111 5.66.386a3.24 3.24 0 0 1 1.825 1.824c.501 1.264.386 4.262.386 5.661 0 1.398.115 4.4-.386 5.66z"
            />
          </svg>
          {loading === "instagram" ? "Yükleniyor..." : "Instagram ile devam et"}
        </Button>
      </div>
    </div>
  );
};
