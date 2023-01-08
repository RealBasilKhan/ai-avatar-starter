import fetch from "node-fetch";
import { encode } from "base64-arraybuffer";

const generateAction = async (req, res) => {
  console.log("Received request");

  const input = JSON.parse(req.body).input;

  const bufferToBase64 = (arrayBuffer) => {
    const base64 = arrayBuffer.toString("base64");
    return `data:image/jpeg;base64,${base64}`;
  };

  // Add fetch request to Hugging Face
  const response = await fetch(
    `https://api-inference.huggingface.co/models/basilk76/stable-diffusion`,
    {
      headers: {
        Authorization: `Bearer ${process.env.HF_AUTH_KEY}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        inputs: input,
      }),
    }
  );

  // Check for different statuses to send proper payload
  if (response.ok) {
    const buffer = await response.arrayBuffer();
    console.log(buffer);
    // Convert to base64
    const base64 = encode(buffer);
    const encodedBuffer = `data:image/jpeg;base64,${base64}`;
    console.log(encodedBuffer);
    // Make sure to change to base64
    res.status(200).json({ image: encodedBuffer });
  } else if (response.status === 503) {
    const json = await response.json();
    res.status(503).json(json);
  } else {
    const json = await response.json();
    res.status(response.status).json({ error: response.statusText });
  }
};

export default generateAction;
