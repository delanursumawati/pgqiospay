/**
 * POST /api/callback/qiospay
 * Webhook endpoint for receiving Qiospay payment notifications
 *
 * Expected payload format:
 * {
 *   "status": "success",
 *   "data": {
 *     "amount": 100000,
 *     "balance": 100000,
 *     "fee": 0,
 *     "issuer": "93600535",
 *     "name": "senowahyu",
 *     "nmid": "ID2025408537103",
 *     "refid": "000000TL0VDN",
 *     "time": "2026-04-12 21:15:25",
 *     "type": "CR"
 *   }
 * }
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateSignature, validateIpAddress } from "@/lib/signature";
import { matchTicketByAmount, fulfillTicket } from "@/lib/tickets";

/** Qiospay webhook data interface */
interface QiospayWebhookData {
  amount: number;
  balance: number;
  fee: number;
  issuer: string;
  name: string;
  nmid: string;
  refid: string;
  time: string;
  type: string;
}

interface QiospayWebhookPayload {
  status: string;
  data: QiospayWebhookData;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Validate IP Address
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Get allowed IPs from settings or env
    const allowedIpsSetting = await prisma.setting.findUnique({
      where: { key: "allowed_webhook_ips" },
    });
    const allowedIps =
      allowedIpsSetting?.value ||
      process.env.ALLOWED_WEBHOOK_IPS ||
      "";

    if (allowedIps && !validateIpAddress(clientIp, allowedIps)) {
      console.warn(`Webhook rejected: unauthorized IP ${clientIp}`);
      return NextResponse.json(
        { error: "Unauthorized IP address" },
        { status: 403 }
      );
    }

    // 2. Read and validate raw body for signature verification
    const rawBody = await request.text();
    const xSignature = request.headers.get("x-signature") || "";

    // Get webhook secret from settings or env
    const webhookSecretSetting = await prisma.setting.findUnique({
      where: { key: "webhook_secret" },
    });
    const webhookSecret =
      webhookSecretSetting?.value ||
      process.env.WEBHOOK_SECRET ||
      "";

    if (webhookSecret && xSignature) {
      if (!validateSignature(rawBody, xSignature, webhookSecret)) {
        console.warn("Webhook rejected: invalid X-Signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 403 }
        );
      }
    }

    // 3. Parse payload
    let payload: QiospayWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // 4. Validate payload structure
    if (!payload.status || !payload.data) {
      return NextResponse.json(
        { error: "Invalid payload structure" },
        { status: 400 }
      );
    }

    // 5. Only process successful credit transactions
    if (payload.status !== "success" || payload.data.type !== "CR") {
      return NextResponse.json({
        message: "Notification acknowledged (non-credit or non-success)",
      });
    }

    // 6. Validate NMID matches our configuration
    const nmidSetting = await prisma.setting.findUnique({
      where: { key: "nmid" },
    });

    if (nmidSetting && nmidSetting.value !== payload.data.nmid) {
      console.warn(
        `Webhook rejected: NMID mismatch. Expected: ${nmidSetting.value}, Got: ${payload.data.nmid}`
      );
      return NextResponse.json(
        { error: "NMID mismatch" },
        { status: 400 }
      );
    }

    // 7. Find matching pending ticket by amount
    const ticket = await matchTicketByAmount(payload.data.amount);

    if (!ticket) {
      console.warn(
        `Webhook: no matching ticket for amount ${payload.data.amount}`
      );
      return NextResponse.json({
        message: "No matching pending ticket found",
        status: "no_match",
      });
    }

    // 8. Fulfill the ticket (update status + add balance)
    await fulfillTicket(ticket.id, payload.data.refid);

    console.log(
      `Webhook: ticket ${ticket.id} fulfilled for user ${ticket.userId}, amount ${payload.data.amount}`
    );

    return NextResponse.json({
      message: "Payment processed successfully",
      ticketId: ticket.id,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
