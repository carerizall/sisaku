const GOOGLE_CALLBACK_PATH = "/api/auth/google/callback";

function isLocalhostUrl(value: string) {
  try {
    const url = new URL(value);
    return ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
}

function getVercelRedirectUri() {
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (!vercelHost) return null;

  const origin = vercelHost.startsWith("http") ? vercelHost : `https://${vercelHost}`;
  return new URL(GOOGLE_CALLBACK_PATH, origin).toString();
}

export function getGoogleRedirectUri(request: Request) {
  const requestRedirectUri = new URL(GOOGLE_CALLBACK_PATH, request.url).toString();
  const configuredRedirectUri = process.env.GOOGLE_REDIRECT_URI?.trim();
  const isProduction = process.env.NODE_ENV === "production";

  if (configuredRedirectUri && (!isProduction || !isLocalhostUrl(configuredRedirectUri))) {
    return configuredRedirectUri;
  }

  if (configuredRedirectUri && isProduction && isLocalhostUrl(configuredRedirectUri)) {
    console.warn("Ignoring localhost GOOGLE_REDIRECT_URI in production.");
  }

  if (isProduction && isLocalhostUrl(requestRedirectUri)) {
    return getVercelRedirectUri() ?? requestRedirectUri;
  }

  return requestRedirectUri;
}