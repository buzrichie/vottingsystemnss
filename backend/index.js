require("dotenv").config();
const XLSX = require("xlsx");
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const voteRoutes = require("./routes/vote");
const bcrypt = require("bcryptjs");
const adminRoutes = require("./routes/admin");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const Admin = require("./models/Admin");
const setDeviceIdCookie = require("./utils/setDeviceIdCookie ");
const Voter = require("./models/Voter");
const csrf = require("csurf");
const http = require("http");
const rateLimit = require("express-rate-limit");

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

    // --- Read and Add Users from processed_data.xlsx ---
    // const filePath =
    //   "./localAssert/NSS_AWUTU_SENYA_EAST_MUNICIPAL_NominalRoll.xlsx";

    // try {
    //   const workbook = XLSX.readFile(filePath);
    //   const sheetName = workbook.SheetNames[0];
    //   const worksheet = workbook.Sheets[sheetName];
    //   const votersDataFromExcel = XLSX.utils.sheet_to_json(worksheet);

    //   const bulkOps = [];
    //   const updatedData = [];

    //   for (const voterData of votersDataFromExcel) {
    //     // Generate a random password
    //     const plainPassword = Math.random().toString(36).slice(-8);
    //     const saltRounds = 10;
    //     const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    //     // Create the database insert operation
    //     bulkOps.push({
    //       insertOne: {
    //         document: {
    //           nssNumber: voterData["NSS NUMBER"],
    //           password: hashedPassword,
    //           hasVoted: false,
    //         },
    //       },
    //     });

    //     // Store plain password for Excel export
    //     updatedData.push({
    //       ...voterData,
    //       Password: plainPassword,
    //     });
    //   }

    //   // Bulk insert to database
    //   await Voter.bulkWrite(bulkOps, { ordered: false });

    //   // Write updated data (with plain passwords) to a new Excel file
    //   const newWorksheet = XLSX.utils.json_to_sheet(updatedData);
    //   const newWorkbook = XLSX.utils.book_new();
    //   XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, "Updated Voters");
    //   XLSX.writeFile(newWorkbook, "awutu-voters_with_passwords.xlsx");

    //   console.log(
    //     `${bulkOps.length} voters added to DB and exported to voters_with_passwords.xlsx`
    //   );
    // } catch (error) {
    //   console.error("Error processing data:", error);
    // }

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
  windowMs: 15 * 60 * 1000,
  max: 30,
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
