const axios = require('axios');
const cheerio = require('cheerio');
const CrawledData = require('../models/CrawledData');
const { cacheData, getCachedData} = require('./redisService');
const userData = require('../models/userData');



const crawlWebsiteService = async (pageUrl) => {
    console.log(`Starting single-page crawl at: ${pageUrl}`);

    // Check if the data is cached
    // const cachedData = await getCachedData(pageUrl)
    // if(cachedData){
    //     console.log(`Serving cached data for ${pageUrl}`);
    //     return {success: true, ur: pageUrl, paragraphs: cachedData.length, cached: true};
    // }

    try {
        console.log(`Crawling: ${pageUrl}`);
        const response = await axios.get(pageUrl, { timeout: 10000 });
        const $ = cheerio.load(response.data);

        // Extract and store content from <p> tags
        const paragraphs = $('p');
        console.log(`Found ${paragraphs.length} <p> tags on ${pageUrl}`);

        // Initialize an array to hold promises for concurrent database saves
        const savePromises = [];

        paragraphs.each((index, elem) => {
            const pText = $(elem).text().trim();
            if (pText) {
                const crawledData = new CrawledData({
                    url: pageUrl,
                    content: pText
                });
                // Push the save promise to the array
                savePromises.push(crawledData.save());
            }
        });

        // Await all save operations concurrently
        await Promise.all(savePromises);

        // Cache the data
        cacheData(pageUrl, savePromises, 3600);

        console.log(`Successfully stored ${savePromises.length} <p> tags from ${pageUrl}`);
        return { success: true, url: pageUrl, paragraphs: savePromises.length };
    } catch (error) {
        console.error(`Error crawling ${pageUrl}:`, error.message);
        throw error;
    }
};


const recursiveCrawl = async (baseUrl, depth = 2, currentDepth = 0, visited = new Set()) => {
  // console.log("Depth service: ", depth);
  // console.log("currentDepth service: ", currentDepth);
    if (currentDepth > depth) return;
    if (visited.has(baseUrl)) return;

    visited.add(baseUrl);

    try {
        console.log(`Crawling (Depth ${currentDepth}): ${baseUrl}`);
        const response = await axios.get(baseUrl, { timeout: 10000 });
        const $ = cheerio.load(response.data);

        // Extract and store <p> tags
        const paragraphs = $('p');
        const savePromises = [];

        paragraphs.each((index, elem) => {
            const pText = $(elem).text().trim();
            if (pText) {
                const crawledData = new CrawledData({
                    url: baseUrl,
                    content: pText,
                });
                savePromises.push(crawledData.save());
            }
        });

        await Promise.all(savePromises);
        console.log(`Stored ${savePromises.length} paragraphs from ${baseUrl}`);

        // Find all internal links
        const links = $('a[href]')
            .map((i, link) => $(link).attr('href'))
            .get()
            .filter(href => href.startsWith(baseUrl) || href.startsWith('/'))
            .map(href => {
                try {
                    return new URL(href, baseUrl).href;
                } catch {
                    return null;
                }
            })
            .filter(link => link !== null && !visited.has(link));

        // Crawl each link recursively
        for (const link of links) {
            await recursiveCrawl(link, depth, currentDepth + 1, visited);
        }
    } catch (error) {
        console.error(`Error crawling ${baseUrl}:`, error.message);
        // Continue crawling other links despite errors
    }

    return { success: true, url: baseUrl, depth: currentDepth };
};

module.exports = { crawlWebsiteService, recursiveCrawl };
