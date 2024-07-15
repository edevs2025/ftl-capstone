import fs from "fs";
import path from "path";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: "sk-proj-sNfRUWMn9Myrg0sJbUDuT3BlbkFJpvgsZ6X7YH6zrSBrr0tb",
});

const speechFile = path.resolve("speech2.mp3");

async function main() {
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "shimmer",
    input: "Hello world, I am going to conquer everything!",
  });
  console.log(`Generated speech file path: ${speechFile}`);
  const buffer = Buffer.from(await mp3.arrayBuffer());
  await fs.promises.writeFile(speechFile, buffer);
}
main();
