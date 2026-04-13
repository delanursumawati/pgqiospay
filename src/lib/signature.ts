/**
 * X-Signature Validation for Webhook Security
 * Validates that incoming webhook requests originate from Qiospay
 */
import { createHmac } from "crypto";

/**
 * Generate an HMAC-SHA256 signature from the request body
 */
export function generateSignature(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

/**
 * Validate the X-Signature header against the request body
 * Uses timing-safe comparison to prevent timing attacks
 */
export function validateSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const expected = generateSignature(body, secret);

  if (expected.length !== signature.length) return false;

  // Timing-safe comparison
  let result = 0;
  for (let i = 0; i < expected.length; i++) {
    result |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Validate IP address against allowed webhook IPs
 * Supports CIDR notation (e.g., "103.56.148.0/24")
 */
export function validateIpAddress(
  clientIp: string,
  allowedIps: string
): boolean {
  if (!allowedIps) return true; // If no IPs configured, allow all

  const allowed = allowedIps.split(",").map((ip) => ip.trim());

  for (const allowedIp of allowed) {
    if (allowedIp.includes("/")) {
      // CIDR check
      if (isIpInCidr(clientIp, allowedIp)) return true;
    } else {
      if (clientIp === allowedIp) return true;
    }
  }

  return false;
}

/**
 * Check if an IP address falls within a CIDR range
 */
function isIpInCidr(ip: string, cidr: string): boolean {
  const [range, bits] = cidr.split("/");
  const maskBits = parseInt(bits);
  // Use unsigned right shift to ensure proper 32-bit integer handling
  const mask = maskBits === 0 ? 0 : (~0 << (32 - maskBits)) >>> 0;

  const ipNum = ipToNumber(ip);
  const rangeNum = ipToNumber(range);

  return (ipNum & mask) === (rangeNum & mask);
}

/**
 * Convert an IPv4 address string to a 32-bit unsigned number
 */
function ipToNumber(ip: string): number {
  return (
    ip
      .split(".")
      .reduce((acc, octet) => ((acc << 8) | parseInt(octet)) >>> 0, 0) >>> 0
  );
}
