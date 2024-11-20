const { required } = require('joi');
const mongoose = require('mongoose');

const menuItemsSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String
    },
    price: {
        required: true,
        type: Number
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'restaurant',
        required: true
      }
},
    {
        timestamps: true
    })

module.exports = mongoose.model('menu_items', menuItemsSchema)