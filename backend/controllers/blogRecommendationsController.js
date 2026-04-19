import axios from 'axios';
import dotenv from 'dotenv';
import Groq from "groq-sdk";

export const getBlogRecommendations = async (req, res) => {
    dotenv.config();
    if (!process.env.GROQ_API_KEY) {
        return res.status(500).json({ error: "GROQ_API_KEY is missing" });
    }
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    // Retrieve parameters from the query string
    const { region } = req.query;

    try {
        // Construct a prompt to generate topics for experts
        const promptText = `Suggest 2 short and recent farming blog topics (max 6 words each) for an expert to write about, addressing current issues like weather or crop health in ${region || 'India'}. Return ONLY the topics, separated by a newline.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: promptText,
                },
            ],
            model: "llama-3.3-70b-versatile",
        });

        const recommendations = chatCompletion.choices[0]?.message?.content || "No topics suggested at this time.";
        
        console.log("Groq Response:", recommendations);
        res.status(200).json({ recommendations });

    } catch (err) {
        console.error("Error fetching expert recommendations from Groq: ", err.message);
        res.status(200).json({ recommendations: "1. Smart Irrigation Techniques\n2. Pest Control Management" });
    }
};
