require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('node:path');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');

const app = express();

// Middleware to generate nonce for each request
app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;
  next();
});

// Apply CORS settings
app.use(cors({
  origin: 'http://localhost:5000', // ✅ your frontend address (adjust if needed)
  credentials: true,
}));

// Apply Content Security Policy (CSP) with nonce
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:5000"],
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
  message: 'Too many requests, please try again later.'
});
app.use(limiter);

// Middleware to prevent directory traversal attacks
app.use((req, res, next) => {
  const requestedPath = path.resolve(path.join(__dirname, 'public', req.url));
  if (!requestedPath.startsWith(path.join(__dirname, 'public'))) {
    return res.status(403).send('Forbidden');
  }
  next();
});

// Serve frontend with nonce replacement
app.get('/', (req, res) => {
  const htmlPath = path.join(__dirname, 'public', 'index.html');

  fs.readFile(htmlPath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Server Error');
      return;
    }

    // Replace placeholder __NONCE__ with actual nonce
    const finalHtml = data.replace(/__NONCE__/g, res.locals.nonce).replace(/__BACKURI__/g, process.env.BASE_URI);;

    res.setHeader('Content-Security-Policy', `script-src 'self' 'nonce-${res.locals.nonce}'`);
    res.send(finalHtml);
  });
});

// Serve static files like images, styles
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
