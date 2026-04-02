export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { idea, budget, hours, skills } = req.body;

  if (!idea || !idea.trim()) {
    return res.status(400).json({ error: "No idea provided" });
  }

  const prompt = `You are a brutally honest business analyst with a dry sense of humour. A user has submitted a "passive income" business idea for evaluation. Your job is to give them a reality check — honest, specific, occasionally funny, but never cruel. Be genuinely helpful underneath the wit.

The idea: "${idea}"
Budget available: ${budget}
Hours per week they can commit: ${hours}
Their skills/background: ${skills}

Respond ONLY with a JSON object (no markdown, no backticks, no preamble). The JSON must have these exact fields:
{
  "score": <number 1-10, where 1 is "this is a fantasy" and 10 is "genuinely brilliant">,
  "oneLiner": "<a single punchy sentence verdict>",
  "reality": "<2-3 sentences on what would actually happen if they tried this>",
  "bestCase": "<1-2 sentences: what does success look like realistically?>",
  "worstCase": "<1-2 sentences: what does failure look like?>",
  "monthlyIncome": "<realistic monthly income estimate after 6 months, be specific with a dollar range>",
  "timeToProfit": "<realistic time estimate to first dollar>",
  "whatYouActuallyNeed": "<2-3 sentences on the skills, resources, or changes needed to make this work>",
  "alternativeAngle": "<1-2 sentences suggesting a better version of this same basic idea>"
}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: "AI evaluation failed" });
    }

    const text = data.content
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("");

    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong" });
  }
}
```

Commit. That's it. Your repo should have exactly this:
```
api/
  evaluate.js
index.html
