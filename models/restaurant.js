const { required } = require('joi');
const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    restaurant_name: {
        required: true,
        type: String
    },
    location: {
        required: true,
        type: String
    },
    days_of_operation: {
        type: [String],
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        required: true
    },
    is24Hours: {
        type: Boolean,
        default: false
    },
    opening_time: {
        type: String,
        required: function () {
            return !this.is24Hours;
        }
    },
    closing_time: {
        type: String,
        required: function () {
            return !this.is24Hours;
        }
    },
    party_size: {
        type: Number,
        required: true
    },
    ratings: {
        type: Number
    },
    live_music: {
        type: Boolean,
        default: false
    },
    outdoor_seating: {
        type: Boolean,
        default: false
    },
    pet_friendly: {
        type: Boolean,
        default: false
    },
    vegan_options: {
        type: Boolean,
        default: false
    },
    wifi: {
        type: Boolean,
        default: false
    },
    image_urls: [
        {
            type: String
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'users',
        required: true,
    },
    menu_items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'menu_items'
    }],
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'reviews'
    }]
},
    {
        timestamps: true
    })

module.exports = mongoose.model('restaurant', restaurantSchema)