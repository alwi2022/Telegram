import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { compareSync, genSaltSync, hashSync } from "bcryptjs";
import { StreamChat } from "stream-chat";
import UserModel from "./models/User";
import jwt from "jsonwebtoken";
const { Expo } = require("expo-server-sdk");




const expo = new Expo();

dotenv.config();
const { PORT, STREAM_API_KEY, STREAM_API_SECRET, MONGO_URI, JWT_SECRET ,STREAM_VIDEO_SECRET} =
  process.env;

const client = StreamChat.getInstance(STREAM_API_KEY!, STREAM_API_SECRET);



const app = express();
app.use(express.json());

const connectMongo = async () => {
  try {
    await mongoose.connect(MONGO_URI!);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed", error);
    process.exit(1);
  }
};

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}


export function generateStreamVideoToken(userId: string) {
  const payload = {
    user_id: userId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 jam
  };

  return jwt.sign(payload, STREAM_VIDEO_SECRET!);
}



app.post("/register", async (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !password || !name) {
    res
      .status(400)
      .json({ message: "email, name , and password are required" });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ message: "password must be at least 6 characters" });
    return;
  }

  const userExistsemail = await UserModel.findOne({ email });
  if (userExistsemail) {
    res.status(400).json({ message: "user email already exists" });
    return;
  }

  const userExistsname = await UserModel.findOne({ name });
  if (userExistsname) {
    res.status(400).json({ message: "user name already exists" });
    return;
  }

  try {
    const salt = genSaltSync(10);
    const passwordHash = hashSync(password, salt);
    const user = await UserModel.create({
      email,
      name,
      password: passwordHash,
    });

    await client.upsertUser({
      id: user._id.toString(),
      email,
      name,
    });
    const token = jwt.sign({ user_id: user._id }, JWT_SECRET!, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email,
        name,
      },
    });
    return;
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
    return;
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "email and password are required" });
    return;
  }

  const user = await UserModel.findOne({ email });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const isPasswordValid = compareSync(password, user.password);
  if (!isPasswordValid) {
    res.status(401).json({ message: "Invalid password" });
    return;
  }

  const token = jwt.sign({ user_id: user._id }, JWT_SECRET!, {
    expiresIn: "7d",
  });
  const videoToken = generateStreamVideoToken(user._id.toString());



  res.status(200).json({
    token,
    videoToken,
    user: {
      id: user._id,
      email,
      name: user.name,
    },
  });
  return;
});

const authMiddleware = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET!); // pakai ! karena sudah didefinisikan

    const user = await UserModel.findById((decoded as any).user_id).select(
      "_id name email"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err: any) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Get list of users except the current user
app.get("/users", authMiddleware, async (req: any, res) => {
  const currentUserId = req.user._id;

  try {
    const users = await UserModel.find({ _id: { $ne: currentUserId } }).select(
      "_id name email"
    );
    res.json(users);
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/me", authMiddleware, async (req: any, res) => {
  res.status(200).json(req.user);
});

// POST /save-push-token
app.post("/save-push-token", async (req, res) => {
  const { userId, token } = req.body;
  try {
    const user = await UserModel.findById(userId); // atau query MongoDB kamu
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    user.pushToken = token;
    await user.save();

    res.json({ message: "Push token saved" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/send-notification", async (req, res) => {
  const { userId, title, body } = req.body;

  try {
    const user = await UserModel.findById(userId);

    if (!user || !user.pushToken) {
       res.status(404).json({ message: "User or pushToken not found" });
       return;
    }

    if (!Expo.isExpoPushToken(user.pushToken)) {
       res.status(400).json({ message: "Invalid Expo push token" });
       return;
    }

    const message = {
      to: user.pushToken,
      sound: "default",
      title: title || "Notification",
      body: body || "You have a new message!",
      data: { userId },
    };

    const chunks = expo.chunkPushNotifications([message]);
    const tickets = [];

    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }

    res.json({ message: "Notification sent", tickets });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ message: "Failed to send notification" });
  }
});







connectMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
//http://localhost:3000/register
//http://localhost:3000/login
