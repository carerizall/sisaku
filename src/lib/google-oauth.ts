const GOOGLE_CALLBACK_PATH = "/api/auth/google/callback";

function isLocalhostUrl(value: string) {
  try {
    const url = new URL(value);
    return ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
}

export function getGoogleRedirectUri(request: Request) {
  const isProduction = process.env.NODE_ENV === "production";
  const configuredRedirectUri = process.env.GOOGLE_REDIRECT_URI?.trim();
  const requestRedirectUri = new URL(GOOGLE_CALLBACK_PATH, request.url).toString();

  // Di production: jangan pernah pakai localhost, abaikan env kalau localhost
  if (isProduction) {
    if (configuredRedirectUri && !isLocalhostUrl(configuredRedirectUri)) {
      console.log("[OAuth] Using configured production redirect_uri:", configuredRedirectUri);
      return configuredRedirectUri;
    }

    if (configuredRedirectUri && isLocalhostUrl(configuredRedirectUri)) {
      console.warn("[OAuth] Ignoring localhost GOOGLE_REDIRECT_URI in production, using request URL");
    }

    // Fallback ke request URL di production (harusnya domain Vercel)
    if (!isLocalhostUrl(requestRedirectUri)) {
      console.log("[OAuth] Using request-based redirect_uri:", requestRedirectUri);
      return requestRedirectUri;
    }

    // Terakhir: pakai Vercel env
    const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
    if (vercelHost) {
      const origin = vercelHost.startsWith("http") ? vercelHost : `https://${vercelHost}`;
      const vercelRedirectUri = new URL(GOOGLE_CALLBACK_PATH, origin).toString();
      console.log("[OAuth] Using Vercel env redirect_uri:", vercelRedirectUri);
      return vercelRedirectUri;
    }

    console.error("[OAuth] No valid redirect_uri found in production!");
  }

  // Development: pakai env kalau ada, atau request URL
  const devRedirectUri = configuredRedirectUri || requestRedirectUri;
  console.log("[OAuth] Using development redirect_uri:", devRedirectUri);
  return devRedirectUri;
}
