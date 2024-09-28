
const { crawlWebsiteService, recursiveCrawl } = require('../services/crawlService');



const crawlWebsiteController =  async (req, res) => {
    const { url, recursive, depth } = req.body;

    // console.log("Depth controller: ", depth);
    if (!url) {
        return res.status(400).json({ message: "URL is required" });
    }

    try {
        if (recursive) {
            const crawlResult = await recursiveCrawl(url, depth || 2);
            res.status(200).json({ message: "Recursive crawl started", data: crawlResult });
        } else {
            const crawlResult = await crawlWebsiteService(url);
            res.status(200).json({ message: "Crawl Started", data: crawlResult });
        }
    } catch (err) {
        console.error("Error crawling website:", err.message);
        res.status(500).json({ message: "Error crawling website", error: err.message });
    }
};

module.exports = crawlWebsiteController;
