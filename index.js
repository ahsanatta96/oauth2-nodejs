import dotenv from "dotenv";
dotenv.config();

import express from "express";
import passport from "passport";
import session from "express-session";
import GoogleStrategy from "passport-google-oauth20";

const app = express();

app.use(
  // This is the session middleware. It is used to store the user data in the session.
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// This is the passport middleware. It is used to initialize passport.
app.use(passport.initialize());
// This is the passport middleware. It is used to store the user data in the session.
app.use(passport.session());

// This is the Google strategy. It is used to authenticate the user using Google.
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      done(null, profile);
    }
  )
);

// User is serialized to the session, meaning that the user data is stored in the session.
passport.serializeUser((user, done) => {
  done(null, user);
});

// User is deserialized from the session, meaning that the user data is retrieved from the session.
passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get("/", (req, res) => {
  res.send(`<a href='/auth/google'>Login with Google</a>`);
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/profile");
  }
);

app.get("/profile", (req, res) => {
  res.send(`Welcome ${req.user.displayName}`);
});

// Logout route
app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
