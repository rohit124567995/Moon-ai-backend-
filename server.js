import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = process.env.OPENROUTER_API_KEY; // Render me store karna

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) return res.status(400).json({ error: "Message required" });

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-lite",
        messages: [
          { role: "system", content: "You are a friendly AI girlfriend for the user." },
          { role: "user", content: userMessage }
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Kuch error aa gaya 😅";

    res.json({ reply });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/", (req, res) => {
  res.send("Backend is running! 👍");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
