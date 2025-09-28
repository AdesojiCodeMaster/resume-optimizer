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
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `Resume: ${resumeText}\n\nJob: ${jobDescription}\n\nGive me key suggestions to optimize this resume for the job.`,
        }),
      }
    );

    const rawText = await response.text(); // read raw text in case it's not valid JSON

    let data;
    try {
      data = JSON.parse(rawText); // try parse JSON
    } catch {
      data = { raw: rawText }; // fallback if not JSON
    }

    return {
      statusCode: response.ok ? 200 : 500,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Server crashed",
        details: error.message,
      }),
    };
  }
          }
        
  
