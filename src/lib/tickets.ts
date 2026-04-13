/**
 * Deposit Ticket Business Logic
 * Handles ticket creation, validation, and expiration
 */
import { prisma } from "./prisma";
import { TicketStatus } from "@/generated/prisma";

const TICKET_EXPIRY_MINUTES = 10;
const TICKET_COOLDOWN_DAYS = 3;

/**
 * Generate a random unique code (1-999) to make the deposit amount unique
 * This helps identify transactions in bank mutations
 */
function generateUniqueCode(): number {
  return Math.floor(Math.random() * 999) + 1;
}

/**
 * Check if a user has an active (non-expired) ticket with the same amount
 * within the cooldown period (3 days)
 */
export async function checkTicketCooldown(
  userId: string,
  amount: number
): Promise<boolean> {
  const cooldownDate = new Date();
  cooldownDate.setDate(cooldownDate.getDate() - TICKET_COOLDOWN_DAYS);

  const existingTicket = await prisma.depositTicket.findFirst({
    where: {
      userId,
      amount,
      status: { in: [TicketStatus.PENDING, TicketStatus.SUCCESS] },
      createdAt: { gte: cooldownDate },
    },
  });

  return !!existingTicket;
}

/**
 * Create a new deposit ticket with unique code and expiry
 */
export async function createDepositTicket(userId: string, amount: number) {
  const uniqueCode = generateUniqueCode();
  const totalAmount = amount + uniqueCode;
  const expiresAt = new Date(
    Date.now() + TICKET_EXPIRY_MINUTES * 60 * 1000
  );

  return prisma.depositTicket.create({
    data: {
      userId,
      amount,
      uniqueCode,
      totalAmount,
      expiresAt,
    },
  });
}

/**
 * Expire all pending tickets that have passed their expiry time
 * Called on-the-fly during queries or via cron
 */
export async function expireOldTickets(): Promise<number> {
  const result = await prisma.depositTicket.updateMany({
    where: {
      status: TicketStatus.PENDING,
      expiresAt: { lt: new Date() },
    },
    data: {
      status: TicketStatus.EXPIRED,
    },
  });

  return result.count;
}

/**
 * Get all tickets for a user with on-the-fly expiration check
 */
export async function getUserTickets(userId: string) {
  // First, expire old tickets
  await expireOldTickets();

  return prisma.depositTicket.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

/**
 * Match a webhook callback to a pending deposit ticket
 * Matches by total amount and pending status
 */
export async function matchTicketByAmount(totalAmount: number) {
  // First expire old tickets
  await expireOldTickets();

  return prisma.depositTicket.findFirst({
    where: {
      totalAmount,
      status: TicketStatus.PENDING,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "asc" },
    include: { user: true },
  });
}

/**
 * Mark a ticket as successful and update user balance
 */
export async function fulfillTicket(ticketId: string, refId: string) {
  return prisma.$transaction(async (tx) => {
    // Update ticket status
    const ticket = await tx.depositTicket.update({
      where: { id: ticketId },
      data: {
        status: TicketStatus.SUCCESS,
        refId,
      },
    });

    // Add balance to user
    await tx.user.update({
      where: { id: ticket.userId },
      data: {
        balance: { increment: ticket.amount },
      },
    });

    return ticket;
  });
}
