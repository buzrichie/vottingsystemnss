const AnalyticsJs = require("../models/Analytics,js");

const logAnalytics = async (deviceId, attempts) => {
  const logData = {
    deviceId,
    count: attempts.count,
    lastAttempt: new Date(attempts.lastAttempt),
    bannedUntil: attempts.bannedUntil ? new Date(attempts.bannedUntil) : null,
  };

  try {
    await AnalyticsJs.findOneAndUpdate(
      { deviceId: logData.deviceId },
      logData,
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );
  } catch (error) {
    console.error("Failed to save analytics:", error);
  }
};

const customRateLimiter = (req, res, next) => {
  // Get deviceId from cookies or IP if deviceId does not exist
  const deviceId = req.cookies["deviceId"] || req.ip;

  // Initialize or retrieve IP/deviceId attempts data
  if (!global.ipAttempts) {
    global.ipAttempts = {};
  }

  // Current timestamp
  const currentTime = Date.now();

  // Retrieve the attempts data for this deviceId
  const attempts = global.ipAttempts[deviceId] || {
    count: 0,
    lastAttempt: 0,
    bannedUntil: null,
  };

  // Check if the deviceId is banned
  if (attempts.bannedUntil && currentTime < attempts.bannedUntil) {
    return res.status(403).json({
      message:
        "Your device is temporarily banned due to repeated failed attempts.",
    });
  }

  // Reset the count if the time window has passed (1 minute of inactivity)
  if (currentTime - attempts.lastAttempt > 60 * 1000) {
    attempts.count = 0;
  }

  // Handle rate-limiting logic (4 failed attempts max)
  if (attempts.count >= 4) {
    // Ban the deviceId for 24 hours after 4 failed attempts
    attempts.bannedUntil = currentTime + 24 * 60 * 60 * 1000; // Ban for 24 hours
    return res.status(403).json({
      message: "Too many failed attempts, your device is temporarily banned.",
    });
  }

  // If failed attempt, increase the count
  attempts.count += 1;
  attempts.lastAttempt = currentTime;

  // Set a cooldown time after the failed attempts (5 mins, then 30 mins after second fail)
  let cooldownTime = 5 * 60 * 1000; // Default cooldown time (5 minutes)
  if (attempts.count === 2) {
    cooldownTime = 30 * 60 * 1000; // 30 minutes after second fail
  }

  // Respond with a rate-limited message
  if (attempts.count > 3) {
    return res.status(429).json({
      message: `Too many requests. Please try again after ${Math.ceil(
        cooldownTime / 1000 / 60
      )} minutes.`,
      retryAfter: cooldownTime / 1000,
    });
  }

  // Store the updated attempts data
  global.ipAttempts[deviceId] = attempts;

  // Log this interaction (exclude permanently blocked IPs)
  if (attempts.count < 4) {
    logAnalytics(deviceId, attempts);
  }

  // Continue to the next middleware
  next();
};

module.exports = customRateLimiter;
