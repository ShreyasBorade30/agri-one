import React, { useState } from 'react';
import './Recommendation.scss';
import newRequest from '../../utils/newRequest.js';

const Recommendation = () => {
    const [climate, setClimate] = useState('');
    const [soilType, setSoilType] = useState('');
    const [cropType, setCropType] = useState('');
    const [cropInfo, setCropInfo] = useState('');
    const [weatherDetails, setWeatherDetails] = useState('');
    const [cropConditions, setCropConditions] = useState('');
    const [recommendation, setRecommendation] = useState([]);
    const [error, setError] = useState('');
    const [loading, setloading] = useState(false);
    const [showOutput, setShowOutput] = useState(false);
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [iotLoading, setIotLoading] = useState(false);

    const fetchIotData = async () => {
        setIotLoading(true);
        try {
            const res = await newRequest.get('/api/iot-sensor-data');
            const { moisture, soilPH, temperature } = res.data;
            setWeatherDetails(`Temperature: ${temperature}, Condition: Clear`);
            setCropConditions(`Moisture: ${moisture}, Soil pH: ${soilPH}`);
        } catch (err) {
            console.error("Failed to fetch IoT data", err);
        } finally {
            setIotLoading(false);
        }
    };

    const cleanMarkdown = (text) => {
        if (!text) return "";
        return text.replace(/(\*\*|\*|##)/g, '').trim();
    };

    const fetchHistory = async () => {
        try {
            const response = await newRequest.get('/api/recommendations/history');
            setHistory(response.data);
        } catch (err) {
            console.error("Failed to fetch history:", err);
        }
    };

    const fetchRecommendation = async () => {
        setloading(true);
        setError('');
        try {
            const response = await newRequest.post('/api/recommendations', {
                climate, soilType, cropType, cropInfo, weatherDetails, cropConditions,
            }, { withCredentials: true });

            if (response.data && response.data.recommendations) {
                const recommendationsArray = response.data.recommendations
                    .split('\n')
                    .filter(item => item.trim() !== '')
                    .map(item => cleanMarkdown(item)); 

                setRecommendation(recommendationsArray);
                setShowOutput(true);
                fetchHistory();
            } else {
                setError("AI did not return any recommendations. Please try again.");
            }
        } catch (err) {
            setError(err.response?.data?.error || "Failed to fetch recommendations");
        } finally {
            setloading(false);
        }
    };

    const toggleHistory = () => {
        if (!showHistory) fetchHistory();
        setShowHistory(!showHistory);
        setShowOutput(false);
    };

    const toggleOutputVisibility = () => {
        setShowOutput(!showOutput);
        setShowHistory(false);
    };

    return (
        <div className='recommendations'>
            <div className="header-section">
                <h2>Crop Recommendations</h2>
                <button className="history-btn" onClick={toggleHistory}>
                    {showHistory ? "Back to Calculator" : "View History"}
                </button>
            </div>

            {showHistory ? (
                <div className="history-section">
                    <h3>Past Recommendations</h3>
                    {history.length > 0 ? (
                        history.map((item) => (
                            <div key={item._id} className="history-card">
                                <div className="history-meta">
                                    <strong>{new Date(item.date).toLocaleDateString()}</strong> - {item.cropType} ({item.climate})
                                </div>
                                <div className="history-content">
                                    {item.recommendations.split('\n').filter(r => r.trim()).map((r, i) => (
                                        <p key={i}>{cleanMarkdown(r)}</p>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No history found.</p>
                    )}
                </div>
            ) : (
                <div className="main-content">
                    {!showOutput ? (
                        <div className="input-form">
                            <div className="iot-section">
                                <button className="iot-btn" onClick={fetchIotData} disabled={iotLoading}>
                                    {iotLoading ? "Reading Sensors..." : "Fetch Live IoT Data"}
                                </button>
                                <p>Get real-time Soil & Weather data automatically</p>
                            </div>
                            <div className="input-group">
                                <label>Climate : </label>
                                <input type="text" value={climate} onChange={(e) => setClimate(e.target.value)} placeholder='e.g., tropical' />
                            </div>
                            <div className="input-group">
                                <label>Soil Type : </label>
                                <input type="text" value={soilType} onChange={(e) => setSoilType(e.target.value)} placeholder="e.g., loamy" />
                            </div>
                            <div className="input-group">
                                <label>Crop Type : </label>
                                <input type="text" value={cropType} onChange={(e) => setCropType(e.target.value)} placeholder="e.g., rice" />
                            </div>
                            <div className="input-group">
                                <label>Crop Info : </label>
                                <input type="text" value={cropInfo} onChange={(e) => setCropInfo(e.target.value)} placeholder="e.g., high yield" />
                            </div>
                            <div className="input-group">
                                <label>Today's Weather : </label>
                                <input type="text" value={weatherDetails} onChange={(e) => setWeatherDetails(e.target.value)} placeholder="e.g., sunny" />
                            </div>
                            <div className="input-group">
                                <label>Crop Conditions : </label>
                                <input type="text" value={cropConditions} onChange={(e) => setCropConditions(e.target.value)} placeholder="e.g., well-irrigated" />
                            </div>
                            <button onClick={fetchRecommendation} disabled={loading}>
                                {loading ? "Loading..." : "Get Recommendations"}
                            </button>
                        </div>
                    ) : (
                        <div className="result">
                            <h3>Farming Recommendations for today : </h3>
                            <div className="recommendation-section">
                                <h4>{`Farming Recommendation for your ${cropType} field : `}</h4>
                                <ul>
                                    {recommendation.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                            <button onClick={toggleOutputVisibility}>Back to Input</button>
                        </div>
                    )}
                </div>
            )}
            {error && <p className='error'>{error}</p>}
        </div>
    );
};

export default Recommendation;
