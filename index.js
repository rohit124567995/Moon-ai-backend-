import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ""; // set this in Railway/Render env
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "gpt-3.5-mini";

app.get("/", (req, res) => res.send("🚀 Moon AI backend running"));

app.post("/api/chat", async (req, res) => {
  const userMessage = (req.body.message || "").toString().slice(0, 2000);

  // quick guard
  if (!userMessage) return res.status(400).json({ error: "missing message" });

  // build prompt (simple)
  const prompt = `You are Moon AI. Reply in Hindi, friendly and short. User: "${userMessage}"`;

  // If OpenRouter key configured -> call it
  if (OPENROUTER_API_KEY) {
    try {
      const payload = {
        model: OPENROUTER_MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 512,
      };

      const r = await fetch("https://api.openrouter.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (!r.ok) {
        const txt = await r.text();
        console.warn("OpenRouter non-ok", r.status, txt);
        // fall through to offline fallback
      } else {
        const data = await r.json();
        // try common shapes
        if (data?.choices && data.choices[0]) {
          const msg = data.choices[0].message?.content || data.choices[0].text || "";
          if (msg) return res.json({ reply: msg });
        }
        if (typeof data?.output === "string") return res.json({ reply: data.output });
        // fallback to stringified response
        return res.json({ reply: JSON.stringify(data).slice(0, 2000) });
      }
    } catch (err) {
      console.error("OpenRouter call error", err.message || err);
      // continue to offline fallback
    }
  }

  // OFFLINE fallback (rich rules)
  const t = userMessage.toLowerCase();
  if (/\b(kisne banaya|kisne banaya hai|who made you)\b/i.test(t)) {
    return res.json({ reply: "Mujhe Rohit ne banaya hai 💖" });
  }
  if (/\b(naam|tum kaun|naam kya)\b/i.test(t)) {
    return res.json({ reply: "Mera naam Moon 🌙 AI hai — tumhara digital dost!" });
  }
  if (/\b(kaise ho|kaise)\b/i.test(t)) {
    return res.json({ reply: "Main bilkul theek hoon 🌸 tum kaise ho?" });
  }

  // generic offline answers
  const offlineCommon = [
    "Server thoda busy hai, thodi der baad try karo 😅",
    "Hmm… batao aur kya chal raha hai?",
    "Acha! ye to mazedar hai 😄 aur batao."
  ];
  return res.json({ reply: offlineCommon[Math.floor(Math.random() * offlineCommon.length)] });
});

const port = Number(process.env.PORT || 5000);
app.listen(port, "0.0.0.0", () => console.log(`🚀 Moon AI backend running on port ${port}`));
