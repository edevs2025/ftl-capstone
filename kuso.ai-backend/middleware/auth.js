// const jwt = require('jsonwebtoken');

const { clerkClient } = require('@clerk/clerk-sdk-node');

const clerkAuth = async (req, res, next) => {
  const sessionToken = req.headers.authorization?.split(' ')[1];
  if (!sessionToken) {
    return res.status(401).json({ error: "No session token provided" });
  }

  try {
    const session = await clerkClient.sessions.verifySession(sessionToken);
    req.userId = session.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid session token" });
  }
};

module.exports = clerkAuth;