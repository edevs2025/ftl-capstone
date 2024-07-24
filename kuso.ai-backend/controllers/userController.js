const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require("../models/user");
const { Webhook } = require("svix");
const { clerkClient } = require('@clerk/clerk-sdk-node');


const handleClerkWebhook = async (req, res) => {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return res.status(500).json({ error: "Missing WEBHOOK_SECRET in environment variables" });
  }

  const headers = req.headers;
  const payload = JSON.stringify(req.body);
  const svix_id = headers["svix-id"];
  const svix_timestamp = headers["svix-timestamp"];
  const svix_signature = headers["svix-signature"];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: "Missing required Svix headers" });
  }

  const webhook = new Webhook(WEBHOOK_SECRET);

  let event;
  try {
    event = webhook.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (error) {
    console.error("Error verifying webhook:", error.message);
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  const { id, username, email_addresses, first_name, last_name } = event.data;
  const eventType = event.type;

  console.log(`Webhook type: ${eventType}`);
  console.log("Webhook data:", event.data);


  try {
    let user;
    switch (eventType) {
      case 'user.created':
      case 'user.updated':
        user = await userModel.upsertUser({
          clerkUserId: id,
          username: username || email_addresses[0].email_address.split('@')[0],
          firstName: first_name || '',
          lastName: last_name || '',
          email: email_addresses[0].email_address,
        });
        break;
      case 'user.deleted':
        user = await userModel.deleteUserByClerkId(id);
        break;
      default:
        return res.status(400).json({ error: "Unsupported event type" });
    }

    res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
      user: user,
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ error: error.message });
  }
};





const login = async (req, res) => {
  try {
    const sessionToken = req.headers.authorization?.split(' ')[1];
    if (!sessionToken) {
      return res.status(401).json({ error: "No session token provided" });
    }

    let session;
    try {
      session = await clerkClient.sessions.verifySession(sessionToken);
    } catch (error) {
      return res.status(401).json({ error: "Invalid session token" });
    }

    const clerkUserId = session.userId;
    const user = await userModel.findUserByClerkId(clerkUserId);

    if (!user) {
      return res.status(404).json({ error: "User not found in the database" });
    }

    const token = jwt.sign(
      { userId: user.userId, clerkUserId: user.clerkUserId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token, user });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};




const createUser = async (req, res) => {
  const USER_CREATED_WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
	if (!USER_CREATED_WEBHOOK_SECRET) {
		throw new Error("You need a WEBHOOK_SECRET in your .env");
	}

	const headers = req.headers;
	const payload = JSON.stringify(req.body);
	const svix_id = headers["svix-id"];
	const svix_timestamp = headers["svix-timestamp"];
	const svix_signature = headers["svix-signature"];
	if (!svix_id || !svix_timestamp || !svix_signature) {
		return res.json({ error: "No svix headers" });
	}
	const webhook = new Webhook(USER_CREATED_WEBHOOK_SECRET);

	let event;

	try {
		event = webhook.verify(payload, {
			"svix-id": svix_id,
			"svix-timestamp": svix_timestamp,
			"svix-signature": svix_signature,
		});
	} catch (error) {
		console.log("Error verifying webhook:", error.message);
		return res.json({
			success: false,
			message: error.message,
		});
	}

	const { username, id, name, email } = event.data;
	const eventType = event.type;
	console.log(`Webhook type: ${eventType}`);
	console.log("Webhook body:", event.data);
  
  try {
    // const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.createUser({  username, id, name, email });
    res.status(201).json({
      success: true,
			message: "Webhook received",
      user: user,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  const { userId } = req.query;
  try {
    const filters = { userId };
    const users = await userModel.getAllUsers(filters);
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  const { username, name, email, password, age, employed, industries, questions, sessions } = req.body;
  const { id } = req.params;
  try {
    const user = await userModel.updateUser(id, {
      username, name, email, password, age, employed, industries, questions, sessions
    });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: `User with ID ${id} not found` });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userModel.getUserById(id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: `User with ID ${id} not found` });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: error.message });
  }
};

const findUserByUsername = async (req, res) => {
	try {
		const user = await userModel.findUserByUsername(req.params);
		res.json(user);
	} catch (error) {
		res.json({ error: error.message });
	}
};


const getUserSessions = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userModel.getUserById(id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: `User with ID ${id} not found` });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  const USER_DELETED_WEBHOOK_SECRET = process.env.WEBHOOK_SECRET_DELETE;
	if (!USER_DELETED_WEBHOOK_SECRET) {
		throw new Error("You need a WEBHOOK_SECRET in your .env");
	}

	const headers = req.headers;
	const payload = JSON.stringify(req.body);
	const svix_id = headers["svix-id"];
	const svix_timestamp = headers["svix-timestamp"];
	const svix_signature = headers["svix-signature"];
	if (!svix_id || !svix_timestamp || !svix_signature) {
		return res.json({ error: "No svix headers" });
	}
	const webhook = new Webhook(USER_DELETED_WEBHOOK_SECRET);

	let event;

	try {
		event = webhook.verify(payload, {
			"svix-id": svix_id,
			"svix-timestamp": svix_timestamp,
			"svix-signature": svix_signature,
		});
	} catch (error) {
		console.log("Error verifying webhook:", error.message);
		return res.json({
			success: false,
			message: error.message,
		});
	}

	const { id } = event.data;
	const eventType = event.type;
	console.log(`Webhook type: ${eventType}`);
	console.log("Webhook body:", event.data);

	try {
		const user = await userModel.deleteUser(id);
		console.log("User deleted");
		return res.json({
			success: true,
			message: "Webhook received",
			user: user,
		});
	} catch (error) {
		return res.json({ error: error.message });
	}
};


const addIndustry = async (req, res) => {
  const { industryId } = req.body;
  const { id: userId } = req.params;
  try {
    const updatedUser = await userModel.addIndustry(userId,  industryId );
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error adding industry to user:", error);
    res.status(500).json({ error: error.message });
  }
};

const addQuestion = async (req, res) => {
  const { questionId } = req.body;
  const { id: userId } = req.params;
  try {
    const updatedUser = await userModel.addQuestion(userId,  questionId );
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error adding question to user:", error);
    res.status(500).json({ error: error.message });
  }
};

const addSession = async (req, res) => {
  const { questions, feedback } = req.body;
  const { id: userId } = req.params;
  try {
    const newSession = await userModel.addSession(userId, { questions, feedback });
    res.status(201).json(newSession);
  } catch (error) {
    console.error("Error adding session for user:", error);
    res.status(500).json({ error: error.message });
  }
};

const removeIndustry = async (req, res) => {
  const { industryId } = req.body;
  const { id: userId } = req.params;
  try {
    const updatedUser = await userModel.removeIndustry(userId, industryId);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error removing industry from user:", error);
    res.status(500).json({ error: error.message });
  }
};

const removeQuestion = async (req, res) => {
  const { questionId } = req.body;
  const { id: userId } = req.params;
  try {
    const updatedUser = await userModel.removeQuestion(userId, questionId);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error removing question from user:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserSessions,
  getUserById,
  deleteUser,
  updateUser,
  addIndustry,
  addQuestion,
  addSession,
  removeIndustry,
  removeQuestion,
  login,
  findUserByUsername,
  handleClerkWebhook,
};