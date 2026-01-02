import { Router } from "express";
import passport from "passport";
import { markUserAsAuthenticated } from "../middleware/authMiddleware.js";
import { storeOAuthTokens } from "../services/redis.service.js";

const router = Router();

// Initiate Google OAuth and pass telegramId in state (and session as fallback)
router.get("/google", (req, res, next) => {
  const telegramId = (req.query.telegramId as string);

  // Validate telegramId is a number
  if (!telegramId || isNaN(Number(telegramId))) {
    return res.status(400).json({
      message: "Invalid or missing telegramId. Must be a valid number."
    });
  }

  // Store in session as a fallback
  (req.session as any).telegramId = telegramId;
  console.log("[/auth/google] Stored telegramId in session:", telegramId);

  // Dynamically invoke passport.authenticate so we can include state per-request
  return passport.authenticate("google", {
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/calendar"
    ],
    // send telegramId in state so Google will return it on callback
    state: telegramId,
    accessType: "offline",
    prompt: "consent"
  })(req, res, next);
});

/**
 * STEP 2: Google callback
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/failure",
    session: true
  }),
  (req, res) => {
    // User successfully authenticated
    // Retrieve telegramId from session or from OAuth state (fallback)
    const telegramId = (req.session as any)?.telegramId || (req.query.state as string) || (req.query.telegramId as string);
    console.log("[/google/callback] Retrieved telegramId (session/state/query):", telegramId);
    console.log("[/google/callback] User from Passport:", req.user);
    
    if (!req.user) {
      console.error("[/google/callback] ERROR: User not attached to request after passport authentication");
      return res.redirect("/auth/failure?reason=no_user_in_request");
    }
    
    if (telegramId) {
      res.redirect(`/auth/success?telegramId=${telegramId}`);
    } else {
      res.redirect("/auth/failure?reason=missing_telegram_id");
    }
  }
);
router.get("/success", async (req, res) => {
  // Extract telegramId from query parameters
  const telegramId = (req.query.telegramId as string);
  const user = req.user as any;
  
  console.log("[/auth/success] telegramId:", telegramId);
  console.log("[/auth/success] user:", user);
  
  // Validate telegramId
  if (!telegramId || isNaN(Number(telegramId))) {
    return res.status(400).json({
      message: "Invalid or missing telegramId",
      debug: {
        hasTelegramId: !!telegramId,
        isValidNumber: !isNaN(Number(telegramId))
      }
    });
  }
  
  if (telegramId && user) {
    // Store OAuth tokens in Redis
    try {
      await storeOAuthTokens(parseInt(telegramId), {
        googleId: user.googleId,
        telegramId: parseInt(telegramId),
        displayName: user.displayName,
        accessToken: user.accessToken,
        refreshToken: user.refreshToken || "",
        createdAt: Date.now()
      });
      
      markUserAsAuthenticated(parseInt(telegramId));
      
      res.json({
        message: "Google account linked successfully and tokens stored",
        user: {
          googleId: user.googleId,
          displayName: user.displayName
        }
      });
    } catch (error) {
      console.error("Error storing OAuth tokens:", error);
      res.status(500).json({
        message: "Authentication succeeded but failed to store tokens",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  } else {
    res.status(400).json({
      message: "Missing telegramId or user information",
      debug: {
        hasTelegramId: !!telegramId,
        hasUser: !!user,
        telegramId: telegramId || "not provided"
      }
    });
  }
});

router.get("/failure", (req, res) => {
  const reason = (req.query.reason as string) || "unknown";
  const failureDetails = (req.query.message as string) || "No additional information";
  
  console.error("[/auth/failure] Authentication failed");
  console.error("[/auth/failure] Reason:", reason);
  console.error("[/auth/failure] Details:", failureDetails);
  console.error("[/auth/failure] User:", req.user);
  console.error("[/auth/failure] Session:", req.session);
  
  res.status(401).json({ 
    message: "Google authentication failed",
    debug: {
      reason,
      failureDetails,
      hasUser: !!req.user,
      sessionTelegramId: (req.session as any)?.telegramId
    }
  });
});

export default router;