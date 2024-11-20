const orderModel = require('../models/order');
const restaurantModel = require('../models/restaurant');
const { orderMapper } = require('../utils/order.mapper');
const orderSchema = require('../validators/order.validator');

exports.createOrder = async (req, res) => {
    try {
        //doing validations
        const { error, value } = orderSchema.validate(req.body, {
            abortEarly: false,
        });

        if (!!error) {
            res.status(400).send({
                status: 400,
                message: error
            });
        } else {
            //checking restaurant is valid
            const restaurant = await restaurantModel.findOne({ _id: req?.body?.restaurant });
            if (!!!restaurant) {
                return res.status(200).send({
                    status: 200,
                    data: restaurant,
                    message: "Invaild Restaurant!",
                });
            } else {
                //checking for order is present for this time
                const checkoOrders = await orderModel.find({
                    restaurant: req?.body?.restaurant,
                    $or: [
                        { from_date: { $lt: req?.body?.to_date }, to: { $gt: req?.body?.from_date } },
                        { from_date: { $gte: req?.body?.from_date, $lte: req?.body?.to_date } },
                        { to_date: { $gte: req?.body?.from_date, $lte: req?.body?.to_date } }
                    ]
                });
                let sum = 0;
                for (let i = 0; i < checkoOrders.length; i++) {
                    sum += checkoOrders?.[i]?.no_of_people;
                }

                let checkCapacity = +restaurant?.party_size - +sum;
                if (+checkCapacity < +req?.body?.no_of_people) {
                    return res.status(400).send({
                        status: 400,
                        message: "Restaurant is full, please try some other time!",
                    });
                } else {
                    //saving
                    await orderModel.create({
                        no_of_people: +req?.body?.no_of_people,
                        from_date: req?.body?.from_date,
                        to_date: req?.body?.to_date,
                        user: req?.user?._id,
                        restaurant: restaurant?.id
                    });

                    return res.status(200).send({
                        status: 200,
                        message: "Order is created!",
                    });
                }
            }
        }

    } catch (error) {
        return res.status(error?.status ? error?.status : 400).send({
            status: 400,
            message: error?.error ? error?.error : "Error found!"
        });
    }
}

exports.cancelOrder = async (req, res) => {
    try {
        //checking order 
        const order = await orderModel.findOne({ _id: req?.params?.orderId, user: req?.user?._id });

        if (!!!order) {
            return res.status(400).send({
                status: 400,
                message: "Order not found!",
            });
        } else {
            //deleting order
            await orderModel.findByIdAndDelete(req?.params?.orderId);

            return res.status(200).send({
                status: 200,
                message: "Order is deleted successfully!",
            });
        }
    } catch (error) {
        return res.status(error?.status ? error?.status : 400).send({
            status: 400,
            message: error?.error ? error?.error : "Error found!"
        });
    }
}

exports.findAll = async (req, res) => {
    try {
        //get restaurant
        const restaurant = await restaurantModel.findOne({ user: req?.user?._id });

        //search parameter 
        const search = req?.body?.filter?.search;
        const search_by = req?.body?.filter?.search_by;

        //adding search fields
        const filter = (!!search && !!search_by) ? filterMapper(req?.body?.filter) : {};

        //sorting 
        const sortFilter = orderMapper(req?.query);

        //pagination parameter
        const skip = (+req?.query.page * +req?.query.per_page) - +req?.query.per_page || 0;
        const limit = req?.query.per_page || 10;


        //checking order 
        const orders = await orderModel.find({ restaurant: restaurant?._id })
            .sort(sortFilter)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('restaurant').populate('user');

        const total = await orderModel.countDocuments({ restaurant: restaurant?._id })

        return res.status(200).send({
            status: 200,
            message: "Orders found successfully!",
            data: orders,
            pagination: {
                page: +skip + 1,
                per_page: +limit,
                total: +total
            }
        });
    } catch (error) {
        console.log(error)
        return res.status(error?.status ? error?.status : 400).send({
            status: 400,
            message: error?.error ? error?.error : "Error found!"
        });
    }
}

exports.findOne = async (req, res) => {
    try {
        //checking order 
        const order = await orderModel.findOne({ _id: req?.params?.orderId }).populate('restaurant').populate('user');

        return res.status(200).send({
            status: 200,
            message: "Order found successfully!",
            data: order
        });
    } catch (error) {
        return res.status(error?.status ? error?.status : 400).send({
            status: 400,
            message: error?.error ? error?.error : "Error found!"
        });
    }
}

exports.findUserOrder = async (req, res) => {
    try {
        //checking order 
        const orders = await orderModel.find({ user: req?.user?._id }).populate('restaurant').populate('user');

        return res.status(200).send({
            status: 200,
            message: "Order found successfully!",
            data: orders
        });
    } catch (error) {
        return res.status(error?.status ? error?.status : 400).send({
            status: 400,
            message: error?.error ? error?.error : "Error found!"
        });
    }
}