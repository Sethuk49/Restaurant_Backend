const Joi = require('joi');

const orderSchema = Joi.object({
    from_date: Joi.string().required(),
    to_date: Joi.string().required(),
    no_of_people: Joi.string().required(),
    restaurant: Joi.string().required()
});

module.exports = orderSchema;