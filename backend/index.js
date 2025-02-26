import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import ImageKit from "imagekit";
import Chat from "./models/chat.js";
import UserChats from "./models/userChat.js";
import User from "./models/user.js"; // User model for authentication

dotenv.config();

const port = process.env.PORT || 3000;
const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "12345";

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL, 
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB with retry logic
const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("✅ Connected to MongoDB");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err);
        setTimeout(connect, 5000); // Retry after 5 seconds
    }
};

// Initialize ImageKit (Ensure environment variables are set)
if (!process.env.IMAGE_KIT_PUBLIC_KEY || !process.env.IMAGE_KIT_PRIVATE_KEY || !process.env.IMAGE_KIT_ENDPOINT) {
    console.error("❌ Missing ImageKit configuration!");
    process.exit(1);
}
const imagekit = new ImageKit({
    publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
    privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGE_KIT_ENDPOINT
});

// ✅ JWT Middleware (Replaces Clerk Auth)
const authenticateUser = (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]; // Allow token from headers
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: "Invalid Token" });
        req.userId = decoded.userId;
        next();
    });
};

// 🔹 Authentication Routes

// Register User
app.post("/api/auth/register", async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) return res.status(400).json({ error: "Email and password required" });

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "Email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "✅ User registered successfully" });
    } catch (err) {
        res.status(500).json({ error: "❌ Registration failed" });
    }
});

// Login User
app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) return res.status(400).json({ error: "Email and password required" });

        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token)
        // res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "strict" })
           .json({ message: "✅ Login successful", token });

    } catch (err) {
        res.status(500).json({ error: "❌ Login failed" });
    }
});

// Get Current User
app.get("/api/user", authenticateUser, (req, res) => {
    res.json({ userId: req.userId });
});

// Logout User
app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token").json({ message: "✅ Logged out successfully" });
});

// 🔹 Image Upload
app.get("/api/upload", (req, res) => {
    const result = imagekit.getAuthenticationParameters();
    res.send(result);
});

// 🔹 Chat Routes (Now Use `authenticateUser` Instead of Clerk)
app.post("/api/chats", authenticateUser, async (req, res) => {
    const { text } = req.body;
    try {
        const newChat = new Chat({
            userId: req.userId,
            history: [{ role: "user", parts: [{ text }] }]
        });
        const savedChat = await newChat.save();

        await UserChats.findOneAndUpdate(
            { userId: req.userId },
            { $push: { chats: { _id: savedChat._id, title: text.substring(0, 40) } } },
            { upsert: true }
        );

        res.status(201).send(savedChat._id);
    } catch (err) {
        res.status(500).send("❌ Error creating Chat!");
    }
});

app.get("/api/userchats", authenticateUser, async (req, res) => {
    try {
        const userChats = await UserChats.findOne({ userId: req.userId });
        res.status(200).send(userChats ? userChats.chats : []);
    } catch (err) {
        res.status(500).send("❌ Error fetching user data.");
    }
});

app.get("/api/chats/:id", authenticateUser, async (req, res) => {
    try {
        const chat = await Chat.findOne({ _id: req.params.id, userId: req.userId });
        if (!chat) return res.status(404).send("Chat not found.");
        res.status(200).send(chat);
    } catch (err) {
        res.status(500).send("❌ Error fetching chat.");
    }
});

app.put("/api/chats/:id", authenticateUser, async (req, res) => {
    const { question, answer, img } = req.body;
    try {
        const newItems = [
            ...(question ? [{ role: "user", parts: [{ text: question }], ...(img && { img }) }] : []),
            { role: "model", parts: [{ text: answer }] }
        ];

        const updatedChat = await Chat.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { $push: { history: { $each: newItems } } },
            { new: true }
        );

        res.status(200).send(updatedChat);
    } catch (err) {
        res.status(500).send("❌ Error adding conversation.");
    }
});

app.delete("/api/chats/:id", authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const chat = await Chat.findOneAndDelete({ _id: id, userId: req.userId });
        if (!chat) return res.status(404).json({ error: "Chat not found" });

        await UserChats.updateOne({ userId: req.userId }, { $pull: { chats: { _id: id } } });
        res.status(200).json({ message: "✅ Chat deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "❌ Failed to delete chat" });
    }
});


// Global Error Handler
app.use((err, req, res, next) => {
    res.status(500).json({ error: "❌ Internal Server Error", details: err.message });
});

// Start Server
app.listen(port, () => {
    connect();
    console.log(`🚀 Server running on port ${port}`);
});
