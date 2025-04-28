exports.validateVotingTime = (req, res, next) => {
    const startTime = new Date(process.env.VOTING_START);
    const endTime = new Date(process.env.VOTING_END);
    const currentTime = new Date();
  
    console.log('Start Time (UTC):', startTime.toISOString());
    console.log('End Time (UTC):', endTime.toISOString());
    console.log('Current Time (UTC):', currentTime.toISOString());
    console.log('StartTime ms:', startTime.getTime());
    console.log('EndTime ms:', endTime.getTime());
    console.log('CurrentTime ms:', currentTime.getTime());
  
    if (currentTime.getTime() < startTime.getTime()) {
      return res.status(403).json({
        success: false,
        message: "Election has not started yet. Please check back later.",
      });
    }
  
    if (currentTime.getTime() > endTime.getTime()) {
      return res.status(403).json({
        success: false,
        message: "Election has ended. Voting is closed.",
      });
    }
  
    console.log("Voting allowed: inside voting period.");
    next();
  };
  