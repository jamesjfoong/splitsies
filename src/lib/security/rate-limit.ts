/**
 * Simple in-memory rate limiter for serverless environments
 * Uses IP-based tracking with sliding window algorithm
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (resets on cold start, which is fine for basic protection)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 10; // Max 10 requests per minute per IP

/**
 * Check if a request should be rate limited
 * @param identifier - Usually the IP address
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetIn: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Clean up expired entries periodically
  if (rateLimitStore.size > 1000) {
    cleanupExpiredEntries(now);
  }

  if (!entry || now > entry.resetTime) {
    // First request or window expired - create new entry
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return {
      allowed: true,
      remaining: MAX_REQUESTS_PER_WINDOW - 1,
      resetIn: RATE_LIMIT_WINDOW_MS,
    };
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }

  // Increment counter
  entry.count++;
  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - entry.count,
    resetIn: entry.resetTime - now,
  };
}

/**
 * Clean up expired entries to prevent memory leak
 */
function cleanupExpiredEntries(now: number): void {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Get client IP from request headers (works with Vercel, Cloudflare, etc.)
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Vercel specific
  const vercelIP = request.headers.get("x-vercel-forwarded-for");
  if (vercelIP) {
    return vercelIP.split(",")[0].trim();
  }

  return "unknown";
}

// Known bot user-agent patterns
const BOT_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /axios/i,
  /node-fetch/i,
  /go-http-client/i,
  /java\//i,
  /libwww/i,
  /httpunit/i,
  /nutch/i,
  /biglotron/i,
  /teoma/i,
  /convera/i,
  /gigablast/i,
  /ia_archiver/i,
];

/**
 * Check if request appears to be from a bot
 */
export function isLikelyBot(request: Request): boolean {
  const userAgent = request.headers.get("user-agent") || "";

  // No user agent is suspicious
  if (!userAgent || userAgent.length < 10) {
    return true;
  }

  // Check against known bot patterns
  for (const pattern of BOT_PATTERNS) {
    if (pattern.test(userAgent)) {
      return true;
    }
  }

  return false;
}

/**
 * Validate request origin for basic CSRF protection
 */
export function isValidOrigin(
  request: Request,
  allowedHosts: string[]
): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // In development, be more lenient
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  // Must have origin or referer for POST requests
  if (!origin && !referer) {
    return false;
  }

  const checkHost = origin || referer || "";

  // Check against allowed hosts
  return allowedHosts.some((host) => checkHost.includes(host));
}
