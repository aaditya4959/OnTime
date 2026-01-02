import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { storeOAuthTokens } from "../services/redis.service.js";
import dotenv from "dotenv";
dotenv.config();

// Interface for user object
interface GoogleUser {
    googleId: string;
    displayName: string;
    accessToken: string;
    refreshToken?: string;
}

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL!
        }, 
        async (accessToken: string, refreshToken: string | undefined, profile: any, done: any) => {
            try {
                //@ts-ignore
                const user: GoogleUser = {
                    googleId: profile.id,
                    displayName: profile.displayName,
                    accessToken,
                    refreshToken
                };
                console.log("✅ Authenticated user from Google:", user);
                return done(null, user);
            } catch (error) {
                console.error("❌ Error in Google strategy callback:", error);
                return done(error);
            }
        }
    )
);

// Serialize user into session
passport.serializeUser((user: any, done) => {
    console.log("[serializeUser] Serializing user:", user);
    done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user: any, done) => {
    console.log("[deserializeUser] Deserializing user:", user);
    done(null, user);
});