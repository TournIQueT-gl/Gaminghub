import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import MemoryStore from "memorystore";
import { storage } from "./storage";

// Track logged out sessions in development
const loggedOutSessions = new Set<string>();

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Use memory store for development to avoid database connection issues
  const Store = MemoryStore(session);
  const sessionStore = new Store({
    checkPeriod: 86400000, // prune expired entries every 24h
  });
  
  return session({
    secret: process.env.SESSION_SECRET || 'development-secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to false for development
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
    username: claims["username"] || `${claims["first_name"] || "User"}${Math.floor(Math.random() * 1000)}`,
    bio: '',
    location: '',
    website: '',
    favoriteGames: [],
    level: 1,
    xp: 0,
    isVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    console.log('Logout request received');
    
    // Add session to logged out list
    const sessionId = req.sessionID || req.session?.id;
    if (sessionId) {
      loggedOutSessions.add(sessionId);
      console.log('Session', sessionId, 'marked as logged out');
    }
    
    // Set logout flag for development mode
    if (req.session) {
      (req.session as any).loggedOut = true;
      (req.session as any).destroyed = true;
      console.log('Session marked as logged out');
    }
    
    req.logout(() => {
      // Clear the session completely
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
        }
        res.clearCookie('connect.sid');
        console.log('Session destroyed and cookie cleared');
        
        if (process.env.NODE_ENV === 'development') {
          res.json({ message: 'Logged out successfully' });
        } else {
          res.redirect(
            client.buildEndSessionUrl(config, {
              client_id: process.env.REPL_ID!,
              post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
            }).href
          );
        }
      });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // In development mode, create a mock user for testing
  if (process.env.NODE_ENV === 'development' && !req.isAuthenticated()) {
    // Check if session exists
    if (!req.session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const sessionId = req.sessionID || req.session.id;
    
    // Check if this session has been logged out
    if (loggedOutSessions.has(sessionId)) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Check legacy session flags
    if ((req.session as any).loggedOut || (req.session as any).destroyed) {
      loggedOutSessions.add(sessionId);
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const mockUser = {
      claims: {
        sub: 'dev-user-123',
        email: 'dev@example.com',
        preferred_username: 'DevUser',
        given_name: 'Dev',
        family_name: 'User',
      }
    };
    
    // Create mock user in storage if it doesn't exist
    try {
      const existingUser = await storage.getUser(mockUser.claims.sub);
      if (!existingUser) {
        await storage.upsertUser({
          id: mockUser.claims.sub,
          email: mockUser.claims.email,
          username: mockUser.claims.preferred_username,
          firstName: mockUser.claims.given_name,
          lastName: mockUser.claims.family_name,
        });
        console.log('Mock user created successfully');
      }
    } catch (error) {
      console.error('Error creating mock user:', error);
    }
    
    (req as any).user = mockUser;
    return next();
  }

  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
