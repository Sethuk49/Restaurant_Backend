const { required } = require('joi');
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    from_date: {
        required: true,
        type: Date
    },
    to_date: {
        required: true,
        type: String
    },
    no_of_people: {
        required: true,
        type: Number
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

module.exports = mongoose.model('orders', orderSchema)