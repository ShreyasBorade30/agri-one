import axios from 'axios'

export const getFarmingNews = async(req, res)=>{
    const api_key = process.env.NEWS_API_KEY;
    
    if (!api_key) {
        console.warn("NEWS_API_KEY is missing. Returning empty news array.");
        return res.status(200).json([]);
    }

    const url = `https://newsapi.org/v2/everything?q=agriculture+OR+farming&sortBy=publishedAt&language=en&apiKey=${api_key}`;

    try{
        const response = await axios.get(url);
        // Map the NewsAPI response to a cleaner format and filter out removed articles
        const articles = (response.data?.articles || [])
            .filter(article => article.title !== "[Removed]")
            .map((article, index) => ({
                id: index,
                title: article.title,
                description: article.description,
                source: { name: article.source.name },
                date: new Date(article.publishedAt).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                url: article.url
            }));
        res.status(200).json(articles);
    }catch(err){
        console.error("Error fetching news : ", err.response?.data || err.message);
        res.status(200).json([]); // Return empty list instead of 500 error
    }
}