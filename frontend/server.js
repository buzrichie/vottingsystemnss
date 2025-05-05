require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("node:path");
const cors = require("cors");
const crypto = require("crypto");
const fs = require("fs");

const app = express();

// Middleware to generate nonce for each request
app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString("base64");
  res.locals.nonce = nonce;
  next();
});
const baseURL =
  process.env.NODE_ENV === "production"
    ? process.env.BACKEND_URI
    : process.env.LOCAL_BACKEND_URI;

// Apply CORS settings
app.use(
  cors({
    origin: baseURL,
    credentials: true,
  })
);

// Apply Content Security Policy (CSP) with nonce
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", baseURL, "ws://localhost:5000"],
      styleSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
      scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
    },
    reportOnly: false,
  })
);

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: "Too many requests, please try again later.",
});
app.use(limiter);

// Middleware to prevent directory traversal attacks
// app.use('/socket.io-client', express.static(path.join(__dirname, 'node_modules/socket.io-client/socket.io.min.js')));
// Serve static files like images, styles
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
  const requestedPath = path.resolve(path.join(__dirname, "public", req.url));
  if (!requestedPath.startsWith(path.join(__dirname, "public"))) {
    return res.status(403).send("Forbidden");
  }
  next();
});

// Serve frontend with nonce replacement
app.get("/config", (req, res) => {
  // Send the baseUri and any other settings you want to expose
  res.json({ baseUri: baseURL });
});

app.get("/", (req, res) => {
  const htmlPath = path.join(__dirname, "public", "index.html");

  fs.readFile(htmlPath, "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Server Error");
      return;
    }

    // Replace placeholder __NONCE__ with actual nonce
    const finalHtml = data.replace(/__NONCE__/g, res.locals.nonce);

    res.setHeader(
      "Content-Security-Policy",
      `script-src 'self' 'nonce-${res.locals.nonce}'`
    );
    res.send(finalHtml);
  });
});

app.get("/*index", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
