import axios from 'axios';

export const getWeatherData = async (req, res) => {
    const { city } = req.query;
    const API_KEY = process.env.OPENWEATHER_API_KEY || '5536c8262dea91ac474b5aa15fa5c774';

    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city || 'Kolkata'}&appid=${API_KEY}&units=metric`);
        res.status(200).json(response.data);
    } catch (err) {
        console.error("Weather API Error:", err.message);
        res.status(err.response?.status || 500).json({ message: "Failed to fetch weather data" });
    }
};
