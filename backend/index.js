require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const voteRoutes = require("./routes/vote");
const bcrypt = require("bcryptjs");
const adminRoutes = require("./routes/admin");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const Admin = require("./models/Admin");
const setDeviceIdCookie = require("./utils/setDeviceIdCookie");
const csrf = require("csurf");
const http = require("http");
const rateLimit = require("express-rate-limit");
const voterToDB = require("./utils/voters_to_database");

const app = express();

// const server = http.createServer(app);
// initializeSocket(server);

app.set("trust proxy", true);

const baseURL =
  process.env.NODE_ENV === "production"
    ? process.env.BASE_URL
    : process.env.LOCAL_BASE_URL;
const corsOptions = {
  origin: baseURL,
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");

    const existingAdmin = await Admin.findOne({ role: "admin" });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(process.env.PASSWORD, 10);

      const newAdmin = new Admin({
        username: "admin",
        password: hashedPassword,
        role: "admin",
      });

      await newAdmin.save();
      console.log("Default admin user created");
    } else {
      console.log("Admin user already exists");
    }

    // await voterToDB("./localAssert/NSS_Demo_Voters.xlsx");

    const PORT = process.env.PORT || 5000;
    const serverListen = app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
    // Attach the server to the Socket.IO instance
    // getIO().atnpm runtach(serverListen);
  })
  .catch((err) => console.log(err));

app.use(setDeviceIdCookie);
app.use((req, res, next) => {
  console.log("Requested path:", req.method);
  console.log("Requested path:", req.url);
  if (process.env.NODE_ENV !== "production") {
    console.log("Requested body:", req.body);
  }
  next();
});
// Apply a general rate limiter
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth", authRoutes);
app.use("/api/vote", voteRoutes);
app.use("/api/admin", adminRoutes);
app.get("/api/server-time", (req, res) => {
  res.status(201).json({
    serverTime: new Date().toISOString(),
    votingStartTime: new Date(process.env.VOTING_START).toISOString(),
    votingEndTime: new Date(process.env.VOTING_END).toISOString(),
  });
});
//CSRF for public a
// app.get("/api/csrf-token", (req, res) => {

// });

// CSRF Error Handler
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }
  next(err);
});

app.get("/", (req, res) => {
  res.status(201).json({
    message: "Welcome",
    path: req.originalUrl,
  });
});
