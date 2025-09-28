import fetch from "node-fetch";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed, use POST" }),
    };
  }

  const { resumeText, jobDescription } = JSON.parse(event.body || "{}");

  if (!resumeText || !jobDescription) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing resumeText or jobDescription" }),
    };
  }

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/gpt2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `Resume: ${resumeText}\n\nJob Description: ${jobDescription}\n\nGive me specific suggestions to optimize this resume for the job.`,
        }),
      }
    );

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error", details: error.message }),
    };
  }
}
