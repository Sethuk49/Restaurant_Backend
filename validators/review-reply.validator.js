const Joi = require('joi');
const restaurant = require('../models/restaurant');

const reviewReplysSchema = Joi.object({
   reply : Joi.string().required(),
});

module.exports = reviewReplysSchema;