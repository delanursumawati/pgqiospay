/**
 * POST /api/setup
 * Initial setup endpoint - creates the first admin account and base settings
 * Only works when no admin users exist in the database
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken, setAuthCookie } from "@/lib/auth";
import { validateCsrfToken } from "@/lib/csrf";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // Check if setup has already been completed
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN" },
    });

    if (adminCount > 0) {
      return NextResponse.json(
        { error: "Setup has already been completed" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, password, name, merchantName, nmid, csrfToken } = body;

    // Validate CSRF token
    if (!csrfToken || !(await validateCsrfToken(csrfToken))) {
      return NextResponse.json(
        { error: "Invalid CSRF token" },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user and settings in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: "ADMIN",
        },
      });

      // Save merchant settings
      if (merchantName) {
        await tx.setting.upsert({
          where: { key: "merchant_name" },
          update: { value: merchantName },
          create: { key: "merchant_name", value: merchantName },
        });
      }

      if (nmid) {
        await tx.setting.upsert({
          where: { key: "nmid" },
          update: { value: nmid },
          create: { key: "nmid", value: nmid },
        });
      }

      // Mark setup as completed
      await tx.setting.upsert({
        where: { key: "setup_completed" },
        update: { value: "true" },
        create: { key: "setup_completed", value: "true" },
      });

      return newUser;
    });

    // Generate JWT and set cookie
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    await setAuthCookie(token);

    return NextResponse.json({
      message: "Setup completed successfully",
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
