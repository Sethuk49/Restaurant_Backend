const Joi = require('joi');
const restaurant = require('../models/restaurant');

const reviewsSchema = Joi.object({
   review : Joi.string().required(),
   restaurant : Joi.string().required(),
   rating : Joi.string().required()
});

module.exports = reviewsSchema;