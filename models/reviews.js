const { required } = require('joi');
const mongoose = require('mongoose');

const reviewsSchema = new mongoose.Schema({
    review: {
        required: true,
        type: String
    },
    rating: {
        required: true,
        type: Number
    },
    reply: {
        type: String
    },
    restaurant: {
        type: mongoose.Schema.ObjectId,
        ref: 'restaurant'
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'users'
    },
},
    {
        timestamps: true
    })

module.exports = mongoose.model('reviews', reviewsSchema)