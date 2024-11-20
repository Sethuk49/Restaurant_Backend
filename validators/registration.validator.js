const Joi = require('joi');

const registrationSchema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    name: Joi.string().required(),
    mobile_number: Joi.string().optional()
});

module.exports = registrationSchema;