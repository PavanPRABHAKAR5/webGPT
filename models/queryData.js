const mongoose = require('mongoose');

const queryDataSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference the User's ID
        ref: 'UserData', // Reference to the UserData model
        required: true // Make it required to track which user initiated the crawl
    },
    url: {
        type : String,
        required : true
    },

    query: {
        type: String,
        required : true
    },

    response: {
        type: String,
        required : true
    },
    queryAt: {
        type: Date,
        default: Date.now,
    }
});

const QueryData = mongoose.model('QueryData', queryDataSchema);

module.exports = QueryData;