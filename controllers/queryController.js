const { readContentFromMongoDB, processContent, generateResponse } = require('../services/openAIService');
const queryData = require('../models/queryData')
const { cacheData, getCachedData } = require("../services/redisService");
/**
 * Handles user queries by generating AI responses based on crawled data.
 */
const queryWebsiteController = async (req, res) => {
    const { query, url } = req.body;
    const userId = req.user;

    // Input Validation
    if (!query) {
        return res.status(400).json({ message: 'Query is required' });
    }

    if (!url) {
        return res.status(400).json({ message: 'URL is required' });
    }

    try {
        // Step 1: Fetch content from MongoDB
        const aggregatedContent = await readContentFromMongoDB(url);

        // Step 2: Process the content (cleaning and chunking)
        const chunks = await processContent(aggregatedContent);

        // Step 3: Concatenate all chunks to form the context.
        const context = chunks.join('\n');

        // Step 4: Generate AI response based on the context and query
        const aiResponse = await generateResponse(query, context, userId, url);

        res.status(200).json({ answer: aiResponse });
    } catch (err) {
        console.error('Error in handling query:', err.message);
        res.status(500).json({ message: 'Error in handling query', error: err.message });
    }
};


const fetchQueryController = async (req, res) => {
    // console.log("fetchQueryController :", req.user)

    

    const userId = req.user.toString();

    const cachedData = await getCachedData(userId); // Ensure the userId is a string here
    if (cachedData) {
        console.log('Returning cached data');
        return res.status(200).json({ data: cachedData });
    }

    let limit = 30;
    try{
        let querylog =await queryData.find({userId: userId}).limit(limit)
        // console.log(querylog)
        let queryDataArr = querylog.map((query)=>{
            return {
                url: query.url,
                query: query.query,
                response: query.response
            }
        })

        cacheData(userId, queryDataArr, 3600);
        res.status(200).json({data: queryDataArr})

    }catch(err){
        console.error('Error in fetching query:', err.message);
        res.status(500).json({ message: 'Error in fetching query', error: err.message });
    }

}

module.exports = {queryWebsiteController, fetchQueryController};
