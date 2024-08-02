// const jwt = require('jsonwebtoken');
const {jwtDecode}  = require('jwt-decode');


const { clerkClient } = require('@clerk/clerk-sdk-node');

const clerkAuth = async (req, res, next) => {
  const sessionToken = req.headers.authorization?.split(' ')[1];
  const decodedToken = jwtDecode(sessionToken);
    console.log(decodedToken)
  if (!sessionToken) {
    return res.status(401).json({ error: "No session token provided" });
  }

  try {
    
    const session = await clerkClient.sessions.verifySession('sess_2jiDvY1ICN675e8brhR58kpgMhx', sessionToken);
    req.userId = session.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid session token" });
  } 
};

module.exports = clerkAuth;