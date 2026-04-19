import axios from 'axios';
import dotenv from 'dotenv';
import Groq from "groq-sdk";

export const getFarmingNotifications = async (req, res) => {
    dotenv.config();
    if (!process.env.GROQ_API_KEY) {
        return res.status(500).json({ error: "GROQ_API_KEY is missing" });
    }
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const weather_key = process.env.OPENWEATHER_API_KEY || '5536c8262dea91ac474b5aa15fa5c774';
    
    // Retrieve region from query string
    const { region } = req.query;
    const city = region || 'Kolkata';

    try {
        // STEP 1: Fetch real-time weather for the region
        const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weather_key}&units=metric`);
        const weather = weatherResponse.data;
        
        const temp = weather.main.temp;
        const condition = weather.weather[0].description;
        const humidity = weather.main.humidity;

        // STEP 2: Ask Groq AI to generate alerts based on THIS weather
        const promptText = `You are an AI Farming Assistant. Current weather in ${city}: ${temp}°C, ${condition}, Humidity: ${humidity}%. 
        Based on this REAL-TIME data, provide 2 very short farming alerts (max 6 words each). 
        If it's rainy, warn about fertilizers. If too hot, suggest irrigation. 
        Return ONLY the alerts, one per line. No introduction.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: promptText }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
        });

        const alerts = chatCompletion.choices[0]?.message?.content || "Check weather conditions for your crops.";
        console.log(`Dynamic Alerts for ${city} generated.`);
        res.status(200).json({ alerts });

    } catch (err) {
        console.error("Error generating dynamic alerts: ", err.message);
        // Fallback to a semi-dynamic message if API fails
        res.status(200).json({ alerts: "Monitor local weather. Ensure proper crop hydration." });
    }
};
