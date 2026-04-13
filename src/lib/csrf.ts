/**
 * CSRF Token Utilities
 * Generates and validates CSRF tokens stored in the database
 */
import { randomBytes } from "crypto";
import { prisma } from "./prisma";

const CSRF_TOKEN_EXPIRY_MINUTES = 60;

/**
 * Generate a new CSRF token and store it in the database
 */
export async function generateCsrfToken(): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(
    Date.now() + CSRF_TOKEN_EXPIRY_MINUTES * 60 * 1000
  );

  await prisma.csrfToken.create({
    data: { token, expiresAt },
  });

  return token;
}

/**
 * Validate a CSRF token from the request
 * Returns true if the token is valid and not expired
 */
export async function validateCsrfToken(token: string): Promise<boolean> {
  if (!token) return false;

  const csrfRecord = await prisma.csrfToken.findUnique({
    where: { token },
  });

  if (!csrfRecord) return false;

  // Check expiry
  if (csrfRecord.expiresAt < new Date()) {
    // Clean up expired token
    await prisma.csrfToken.delete({ where: { id: csrfRecord.id } });
    return false;
  }

  // Delete the token after validation (single-use)
  await prisma.csrfToken.delete({ where: { id: csrfRecord.id } });
  return true;
}

/**
 * Clean up expired CSRF tokens periodically
 */
export async function cleanupExpiredCsrfTokens(): Promise<void> {
  await prisma.csrfToken.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
}
