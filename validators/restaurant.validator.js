const Joi = require('joi');

const createRestaurantProfileSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    mobile_number: Joi.string().required(),
    password: Joi.string().required(),
    restaurant_name: Joi.string().required(),
    location: Joi.string().required(),
    days_of_operation: Joi.array().items(Joi.string()).required(),
    is24Hours: Joi.boolean().required(),
    party_size: Joi.number().required(),
    // image_urls: Joi.array().items(Joi.string()).required(),
    opening_time: Joi.string().optional(),
    closing_time: Joi.string().optional(),
    live_music: Joi.boolean().optional(),
    outdoor_seating: Joi.boolean().optional(),
    pet_friendly: Joi.boolean().optional(),
    vegan_options: Joi.boolean().optional(),
    wifi: Joi.boolean().optional(),
});

module.exports = createRestaurantProfileSchema;