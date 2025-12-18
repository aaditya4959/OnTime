import { Router } from "express";
import passport from "passport";

const router = Router();

// Redirect user to Google

router.get(
    "/google",
    passport.authenticate("google", {
        scope: [
            "profile",
            "email",
            "https://www.googleapis.com/auth/calendar"
        ]
    })
)

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
    res.redirect("/auth/success");
  }
);

router.get("/success", (req, res) => {
  res.json({
    message: "Google account linked successfully",
    user: req.user
  });
});

router.get("/failure", (req, res) => {
  res.status(401).json({ message: "Google authentication failed" });
});

export default router;