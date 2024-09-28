const mongoose = require('mongoose');

const CrawlData = new mongoose.Schema({
    url: {
        type : String,
        required : true
    },

    content: {
        type: String,
        required : true
    },

    crawledAt: {
        type: Date,
        default: Date.now,
    }
});

const CrawledData = mongoose.model('CrawledData', CrawlData);

module.exports = CrawledData;
