const userModel = require('../models/user');
const { filterMapper } = require('../utils/filter.mapper');
const { orderMapper } = require('../utils/order.mapper');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const loginSchema = require('../validators/auth.validator');
const registrationSchema = require('../validators/registration.validator');

exports.login = async (req, res) => {
    try {
        //doing validations
        const { error, value } = loginSchema.validate(req.body, {
            abortEarly: false,
        });

        if (!!error) {
            res.status(400).send({
                status: 400,
                message: error
            });
        } else {
            //checking for valid user or not
            const user = await userModel.findOne({ email: req?.body?.email });

            if (!!!user) return res.status(400).send({
                status: 400,
                message: "User not found!"
            });

            //checking password
            const checkPassword = await bcrypt.compare(req?.body?.password, user?.password);

            if (!!!checkPassword) return res.status(400).send({
                status: 400,
                message: "Invalid password!"
            });

            //removing password
            let userPayload = { ...user?._doc };
            delete userPayload.password;

            // const payload = {
            //     _id: user?._id,
            //     name: user?.name,
            //     email: user?.email,
            //     mobile_number: user?.mobile_number,
            //     role: user?.role
            // }

            //generating token
            const token = jwt.sign({ ...userPayload }, process.env.JWT_SECRET);

            return res.status(200).send({
                status: 200,
                message: "Login successfully!",
                token: token,
                data: userPayload
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(400).send({
            status: 400,
            message: "Error found!",
            error: error
        });
    }
}

exports.getUser = async (req, res) => {
    try {
        const user = await userModel.findById(req?.user?._id);

        //removing password 
        let data = { ...user?._doc };
        delete data.password;

        if (!!!data) return res.status(400).send({
            status: 400,
            message: "User not found!"
        });

        return res.status(200).send({
            status: 200,
            message: "User found successfully!",
            data: data
        });

    } catch (error) {
        console.log(error)
        return res.status(400).send({
            status: 400,
            message: "Error found!",
            error: error
        });
    }
}

exports.regesterUser = async (req, res) => {
    //doing validations
    const { error, value } = registrationSchema.validate(req.body, {
        abortEarly: false,
    });

    if (!!error) {
        res.status(400).send({
            status: 400,
            message: error
        });
    } else {
        //checking for email
        const user = await userModel.findOne({ email: req?.body?.email });

        if (!!user) return res.status(400).send({
            status: 400,
            message: "Email alerady present, please login!"
        });

        const salt = await bcrypt.genSalt(+process.env.HASH);
        const hash = await bcrypt.hash(req?.body?.password, salt);

        const payload = {
            name: req?.body?.name,
            email: req?.body?.email,
            mobile_number: req?.body?.mobile_number,
            password: hash,
            role: "user"
        }
        await userModel.create(payload)

        return res.status(200).send({
            status: 200,
            message: "Registration completed successfully, Please Login!"
        });
    }
}