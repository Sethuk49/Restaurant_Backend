const Joi = require('joi');

const createMenuItemSchema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required(),
});

module.exports = createMenuItemSchema;