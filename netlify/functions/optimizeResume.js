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
