/**
 * GET /api/settings - Get all settings (admin only)
 * PUT /api/settings - Update settings (admin only)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { validateCsrfToken } from "@/lib/csrf";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { merchantName, nmid, webhookSecret, allowedWebhookIps, csrfToken } =
      body;

    // Validate CSRF token
    if (!csrfToken || !(await validateCsrfToken(csrfToken))) {
      return NextResponse.json(
        { error: "Invalid CSRF token" },
        { status: 403 }
      );
    }

    // Update settings in a transaction
    await prisma.$transaction(async (tx) => {
      const settingsToUpdate: Record<string, string> = {};

      if (merchantName !== undefined) settingsToUpdate["merchant_name"] = merchantName;
      if (nmid !== undefined) settingsToUpdate["nmid"] = nmid;
      if (webhookSecret !== undefined) settingsToUpdate["webhook_secret"] = webhookSecret;
      if (allowedWebhookIps !== undefined) settingsToUpdate["allowed_webhook_ips"] = allowedWebhookIps;

      for (const [key, value] of Object.entries(settingsToUpdate)) {
        await tx.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }
    });

    return NextResponse.json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
