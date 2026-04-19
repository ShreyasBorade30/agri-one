import Groq from "groq-sdk";
import Recommendation from "../models/recommendationModel.js";

// SIMULATED IoT SENSOR DATA (Integration Logic)
export const getIotSensorData = async (req, res) => {
    // In real scenario, this would fetch from an IoT Cloud (AWS/Azure)
    const mockData = {
        moisture: Math.floor(Math.random() * (80 - 20) + 20) + "%",
        soilPH: (Math.random() * (8.5 - 5.5) + 5.5).toFixed(1),
        nitrogen: Math.floor(Math.random() * 100) + " mg/kg",
        temperature: Math.floor(Math.random() * (40 - 15) + 15) + "°C"
    };
    res.status(200).json(mockData);
};

export const aiChatbot = async (req, res) => {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { message } = req.body;
    const userId = req.userId;

    try {
        // Fetch User's farming history for context
        const userHistory = await Recommendation.find({ userId }).sort({ createdAt: -1 }).limit(3);
        const context = userHistory.map(h => `Crop: ${h.cropType}, Soil: ${h.soilType}`).join(" | ");

        const promptText = `You are an AI Agriculture Expert. 
        User Context (Past crops): ${context || "New User"}
        Question: ${message}
        Provide a concise, helpful answer in farming terms.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: promptText }],
            model: "llama-3.3-70b-versatile",
        });

        res.status(200).json({ reply: chatCompletion.choices[0]?.message?.content });
    } catch (err) {
        res.status(500).json({ error: "Chatbot unavailable" });
    }
};

export const getRecommendations = async (req, res) => {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        const userId = req.userId; // From verifyToken middleware

        if (!apiKey) {
            console.error("GROQ_API_KEY is missing in backend .env");
            return res.status(500).json({ error: "GROQ_API_KEY is missing" });
        }
        
        const groq = new Groq({ apiKey });
        
        const { climate, soilType, cropType, cropInfo, weatherDetails, cropConditions } = req.body;
        
        const promptText = `You are a Senior Agricultural Scientist. A farmer provides:
        - Crop: ${cropType}, Climate: ${climate}, Soil: ${soilType}, Weather: ${weatherDetails}
        TASK: Validate if suitable. If not, give WARNING and alternatives. If yes, give tips. Bullet points only.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: promptText }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.2,
        });

        const recommendations = chatCompletion.choices[0]?.message?.content || "No recommendations found.";
        
        // Save to Database
        await Recommendation.create({
            userId, climate, soilType, cropType, cropInfo, weatherDetails, cropConditions, recommendations
        });

        res.status(200).json({ recommendations });

    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).json({ error: "Failed to fetch recommendations" });
    }
};

export const getRecommendationHistory = async (req, res) => {
    try {
        const userId = req.userId;
        const history = await Recommendation.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json(history);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch history" });
    }
};
