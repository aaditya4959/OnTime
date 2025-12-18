import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import dotenv from "dotenv";
dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL!
            
            // I think the below given args are not required for basic OAuth
            // accessType: "offline",
            // prompt: "consent"
        }, 
        // Need to fix the types later
        async (accessToken: any, refreshToken: any, profile: any, done: any)=> {
            // Here, you would typically find or create a user in your database
            const user = {
                googleId: profile.id,
                displayName: profile.displayName,
                accessToken,
                refreshToken
            };
            console.log("Authenticated user:", user);
            return done(null, user);
        }
    )
);

// Required by passport (even if not using sessions heavily)
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});