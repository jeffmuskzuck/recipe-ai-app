import fetch from "cross-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");
  const { prompt } = req.body || {};

  if (!prompt) return res.status(400).send("Missing prompt");

  // Use your server-side OpenAI key from environment variable
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).send("OpenAI key not configured");

  try {
    const system = `You are a recipe generator. Return JSON exactly as:
{
  "name": "...",
  "description": "...",
  "ingredients": ["...","..."],
  "steps": ["...","..."]
}
Keep replies short and practical.`;

    const chatBody = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    };

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(chatBody)
    });

    const json = await r.json();
    const text = json.choices?.[0]?.message?.content;

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      // If parsing fails, return raw text inside an error object
      return res.status(500).json({ error: "Failed to parse model output", raw: text });
    }

    return res.status(200).json({ recipe: parsed });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
