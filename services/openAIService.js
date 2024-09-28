
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const { cacheData, getCachedData } = require("./redisService"); 
const CrawledData = require('../models/CrawledData');
const userData = require('../models/userData');
const queryData = require('../models/queryData');   

/**
 * Generates a response to the user's query based on the provided context using OpenAI.
 */
const generateResponse = async (query, context, userId, url) => {

    const cacheKey = `${query}:${context}`;
    const cachedResponse = await getCachedData(cacheKey);
    if(cachedResponse){
        const queryCachedContext = await queryData.create({
            userId: userId,
            url: url,
            query: query,
            response: context,
        });

        // console.log(`Query cached data: ${queryCachedContext}`);
        console.log(`Serving cached response for ${cacheKey}`);
        return cachedResponse;
    }

    try {
        console.log('Query:', query);
        // console.log('Context:', context);

        const messages = [
            {
                role: 'system',
                content: `Based on the provided context here give the answer to the question \n ${context}`,
            },
            {
                role: 'user',
                content: `Context:\n${context}\n\nQuestion:\n${query}`,
            },
        ];

        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo', 
            messages: messages,
            max_tokens: 500,
            temperature: 0.7,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
        });

        if (response.data && response.data.choices && response.data.choices.length > 0) {
            const answere = response.data.choices[0].message.content.trim();

            // Cache the response
            cacheData(cacheKey, answere, 3600);

            const queryContext = await queryData.create({
                userId: userId,
                url: url,
                query: query,
                response: answere,
            });

            // console.log(`Query data: ${queryContext}`);
            return answere;
        } else {
            throw new Error('No response from OpenAI');
        }
    } catch (error) {
        console.error('Error generating AI response:', error.response ? error.response.data : error.message);
        throw new Error('Failed to generate response from AI.');
    }
};

/**
 * Reads crawled content from MongoDB based on the provided URL.
 */
const readContentFromMongoDB = async (url) => {
    try {
        const crawledDocs = await CrawledData.find({ url });
        if (!crawledDocs || crawledDocs.length === 0) {
            throw new Error('No crawled data found for the provided URL.');
        }
        // Combine all content into a single string
        const aggregatedContent = crawledDocs.map(doc => doc.content).join('\n');
        return aggregatedContent;
    } catch (error) {
        console.error('Error reading content from MongoDB:', error.message);
        throw error;
    }
};

/**
 * Cleans the provided text by removing non-alphabetic characters and converting to lowercase.
 */
const cleanText = (text) => {
    const lines = text.split('\n');
    const cleanLines = lines.map(line => line.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().trim());
    const cleanText = cleanLines.join('\n');
    return cleanText;
};

/**
 * Splits the text into chunks of specified size.
 */
const createChunks = (text, chunkSize = 6) => {
    const lines = text.split('\n').filter(line => line.length > 0);
    const chunks = [];
    for (let i = 0; i < lines.length; i += chunkSize) {
        const chunk = lines.slice(i, i + chunkSize).join('\n');
        chunks.push(chunk);
    }
    return chunks;
};

/**
 * Processes the content: cleans and chunks the text.
 */
const processContent = async (content) => {
    try {
        const cleanedContent = cleanText(content);
        const chunks = createChunks(cleanedContent);
        return chunks;
    } catch (error) {
        console.error('Error processing content:', error.message);
        throw error;
    }
};

module.exports = {
    readContentFromMongoDB,
    processContent,
    generateResponse,
};
