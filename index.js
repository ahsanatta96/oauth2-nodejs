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

// Home page
// app.get("/", (req, res) => {
//   res.send(`<a href='/auth/google'>Login with Google</a>`);
// });

app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/profile");
  } else {
    res.send(`<a href='/auth/google'>Login with Google</a>`);
  }
});

// Google authentication
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google authentication callback
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/profile");
  }
);

// Profile details
app.get("/profile", (req, res) => {
  if (!req.user) {
    return res.redirect("/");
  }
  res.send(`
    <h1>Welcome ${req?.user?.displayName}!</h1>
    <img src="${req?.user?.photos[0]?.value}" />
    <p>Email: ${req?.user?.emails[0]?.value}</p>
    <a href="/logout">Logout</a>
  `);
});

// Logout
app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
