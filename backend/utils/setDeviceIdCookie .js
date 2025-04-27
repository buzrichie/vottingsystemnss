const { v4: uuidv4 } = require('uuid');

const setDeviceIdCookie = (req, res, next) => {
  // Check if the deviceId cookie is already set
   
  if (!req.cookies["deviceId"]) {
    // If it's not set, generate a new UUID
    const deviceId = uuidv4();

    // Set the cookie in the response with options
    res.cookie('deviceId', deviceId, {
        maxAge: 3 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
        sameSite: "None",
        
    });
      
  }
  next();
};

module.exports = setDeviceIdCookie;
