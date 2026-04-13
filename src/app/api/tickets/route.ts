/**
 * GET /api/tickets - Get user's deposit tickets
 * POST /api/tickets - Create a new deposit ticket
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { validateCsrfToken } from "@/lib/csrf";
import {
  createDepositTicket,
  checkTicketCooldown,
  getUserTickets,
} from "@/lib/tickets";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tickets = await getUserTickets(authUser.userId);

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Get tickets error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, csrfToken } = body;

    // Validate CSRF token
    if (!csrfToken || !(await validateCsrfToken(csrfToken))) {
      return NextResponse.json(
        { error: "Invalid CSRF token" },
        { status: 403 }
      );
    }

    // Validate amount
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 10000) {
      return NextResponse.json(
        { error: "Minimum deposit amount is Rp 10.000" },
        { status: 400 }
      );
    }

    if (numAmount > 50000000) {
      return NextResponse.json(
        { error: "Maximum deposit amount is Rp 50.000.000" },
        { status: 400 }
      );
    }

    // Check 3-day cooldown for same amount
    const hasCooldown = await checkTicketCooldown(authUser.userId, numAmount);
    if (hasCooldown) {
      return NextResponse.json(
        {
          error:
            "You already have a ticket with this amount in the last 3 days. Please use a different amount or wait.",
        },
        { status: 429 }
      );
    }

    // Create the deposit ticket
    const ticket = await createDepositTicket(authUser.userId, numAmount);

    return NextResponse.json({
      message: "Deposit ticket created successfully",
      ticket,
    });
  } catch (error) {
    console.error("Create ticket error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
