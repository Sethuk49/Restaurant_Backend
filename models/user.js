const { required } = require('joi');
const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String
    },
    email: {
        required: true,
        type: String
    },
    mobile_number: {
        required: true,
        type: String
    },
    password: {
        required: true,
        type: String
    },
    role: {
        required: true,
        type: String,
        enum: ['admin', 'restaurant_owner', 'user'],
        default: 'NEW'
    },
    restaurant: {
        type: mongoose.Schema.ObjectId,
        ref: 'restaurant'
    },
},
    {
        timestamps: true
    })

module.exports = mongoose.model('users', usersSchema)