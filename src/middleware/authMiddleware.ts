import { Context } from "telegraf";

// In-memory store to track authenticated Telegram users
// In production, this should be stored in a database
const authenticatedUsers = new Set<number>();

/**
 * Check if a Telegram user is authenticated via Google OAuth
 * @param telegramId - The Telegram user ID
 * @returns true if the user is authenticated, false otherwise
 */
export const isUserAuthenticated = (telegramId: number): boolean => {
  return authenticatedUsers.has(telegramId);
};

/**
 * Mark a Telegram user as authenticated
 * @param telegramId - The Telegram user ID
 */
export const markUserAsAuthenticated = (telegramId: number): void => {
  authenticatedUsers.add(telegramId);
  console.log(`User ${telegramId} marked as authenticated`);
};

/**
 * Remove a Telegram user from authenticated users
 * @param telegramId - The Telegram user ID
 */
export const removeUserAuthentication = (telegramId: number): void => {
  authenticatedUsers.delete(telegramId);
  console.log(`User ${telegramId} removed from authenticated users`);
};

/**
 * Middleware for Telegraf to check if user is authenticated before processing messages
 * @param ctx - Telegraf context
 * @param next - Next middleware function
 */
export const requireAuth = async (ctx: Context, next: () => Promise<void>) => {
  const telegramId = ctx.from?.id;

  if (!telegramId) {
    ctx.reply("Unable to identify your Telegram ID. Please try again.");
    return;
  }

  if (!isUserAuthenticated(telegramId)) {
    ctx.reply(
      "You need to authenticate first. Please use /google_auth command to link your Google account."
    );
    return;
  }

  // User is authenticated, proceed to the next handler
  await next();
};
