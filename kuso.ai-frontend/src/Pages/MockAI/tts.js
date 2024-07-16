import express from "express";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey: "sk-proj-sNfRUWMn9Myrg0sJbUDuT3BlbkFJpvgsZ6X7YH6zrSBrr0tb",
});

app.use(
  cors({
    origin: "http://localhost:5173", // Replace this with your frontend's origin
  })
);

app.use(express.json());

app.post("/generate-tts", async (req, res) => {
  const { text } = req.body;
  const speechFile = path.resolve("speech.mp3");

  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "shimmer",
      input: text,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);
    res.sendFile(speechFile);
  } catch (error) {
    console.error("Error generating speech:", error);
    res.status(500).send("Error generating speech");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
