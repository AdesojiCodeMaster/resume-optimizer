// netlify/functions/optimizeResume.js
// Uses built-in fetch (no extra dependency required)
exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed, use POST" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const resumeText = (body.resumeText || "").trim();
    const jobDescription = (body.jobDescription || "").trim();

    if (!resumeText || !jobDescription) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing resumeText or jobDescription" }),
      };
    }

    const HF_API_KEY = process.env.HF_API_KEY;
    if (!HF_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing HF_API_KEY on server" }),
      };
    }

    // Instruction prompt: ask model to return JSON ONLY
    const prompt = `
You are an expert career coach and resume writer.  Output valid JSON only (no extra text).
Produce an object with these keys:
- "optimized_resume": string -> a short tailored resume summary or bullet-format phrasing that the candidate should use to better match the job.
- "suggestions": array of short strings -> actionable items (what to add/modify).
- "matched_skills": array of strings -> skills present in both resume and job description.
- "missing_skills": array of strings -> skills required by job but missing from resume.

Job Description:
${jobDescription}

Candidate Resume:
${resumeText}

Return JSON only. Example:
{
  "optimized_resume": "…",
  "suggestions": ["Add Next.js project", "Mention React hooks experience"],
  "matched_skills": ["React","JavaScript"],
  "missing_skills": ["Next.js"]
}
`;

    // Pick an instruction-capable model available on Hugging Face. If you want another model, replace below.
    const modelUrl =
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";

    const hfResponse = await fetch(modelUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 400,
          do_sample: false
        }
      }),
    });

    const raw = await hfResponse.text(); // read raw text so we can handle non-JSON responses

    // Helper: try parse JSON, or extract JSON substring if model added a small prefix/suffix
    function tryParseJSON(text) {
      if (!text) return null;
      try {
        return JSON.parse(text);
      } catch (e) {
        // attempt to find first { ... } block
        const start = text.indexOf("{");
        const end = text.lastIndexOf("}");
        if (start !== -1 && end !== -1 && end > start) {
          const candidate = text.substring(start, end + 1);
          try {
            return JSON.parse(candidate);
          } catch (e2) {
            return null;
          }
        }
        return null;
      }
    }

    const parsed = tryParseJSON(raw);

    // If parsed JSON found, return it. If not, return raw with debugging info.
    if (parsed) {
      return {
        statusCode: hfResponse.ok ? 200 : 500,
        body: JSON.stringify(parsed),
      };
    }

    // No valid JSON parsed — return raw text so you can inspect what the model returned.
    return {
      statusCode: hfResponse.ok ? 200 : 500,
      body: JSON.stringify({ raw: raw }),
    };
  } catch (err) {
    console.error("optimizeResume error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error", details: err.message }),
    };
  }
};
      
