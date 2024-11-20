const restaurantModel = require('../models/restaurant');
const reviewsModel = require('../models/reviews');
const reviewSchem = require('../validators/review.validator');
const reviewReplysSchema = require('../validators/review-reply.validator');
const { orderMapper } = require('../utils/order.mapper');

exports.create = async (req, res) => {
    try {
        //doing validations
        const { error, value } = reviewSchem.validate(req.body, {
            abortEarly: false,
        });

        if (!!error) {
            res.status(400).send({
                status: 400,
                message: error
            });
        } else {
            //getting restaurant 
            const restaurant = await restaurantModel.findOne({ _id: req?.body?.restaurant }).populate('menu_items').populate('reviews');

            if (!!!restaurant) {
                return res.status(400).send({
                    status: 400,
                    message: "Restaurant not found!",
                });
            } else {
                const review = await reviewsModel.create({
                    review: req?.body?.review,
                    restaurant: req?.body?.restaurant,
                    rating : req?.body?.rating,
                    user: req?.user?._id
                });

                const oldreviews = [];
                restaurant?.reviews?.map((r) => {
                    oldreviews.push(r?._id)
                })

                // //updating in restaurants
                const restaurantPayload = {
                    reviews: [...oldreviews, review?._id]
                }
                await restaurantModel.updateOne({ _id: restaurant?._id }, restaurantPayload)

                return res.status(200).send({
                    status: 200,
                    message: "Review and Rating is added successfully!",
                });
            }
        }
    } catch (error) {
        return res.status(error?.status ? error?.status : 400).send({
            status: 400,
            message: error?.error ? error?.error : "Error found!"
        });
    }
}

exports.edit = async (req, res) => {
    try {
        //doing validations
        const { error, value } = reviewSchem.validate(req.body, {
            abortEarly: false,
        });

        if (!!error) {
            res.status(400).send({
                status: 400,
                message: error
            });
        } else {
            const review = await reviewsModel.findOne({ _id: req?.params?.reviewId, user: req?.user?._id });
            if (!!!review) {
                return res.status(200).send({
                    status: 200,
                    message: "Review not found!",
                });
            } else {
                await reviewsModel.updateOne({
                    _id: req?.params?.reviewId
                }, {
                    review: req?.body?.review
                });

                return res.status(200).send({
                    status: 200,
                    message: "Review is updated successfully!",
                });
            }
        }
    } catch (error) {
        console.log(error)
        return res.status(error?.status ? error?.status : 400).send({
            status: 400,
            message: error?.error ? error?.error : "Error found!"
        });
    }
}

exports.delete = async (req, res) => {
    try {

        const review = await reviewsModel.findOne({ _id: req?.params?.reviewId, user: req?.user?._id });
        if (!!!review) {
            return res.status(200).send({
                status: 200,
                message: "Review not found!",
            });
        } else {
            await reviewsModel.deleteOne({ _id: req?.params?.reviewId });

            return res.status(200).send({
                status: 200,
                message: "Review is deleted successfully!",
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(error?.status ? error?.status : 400).send({
            status: 400,
            message: error?.error ? error?.error : "Error found!"
        });
    }
}

exports.getReviewByResaturant = async (req, res) => {
    try {
        const reviews = await reviewsModel.find({
            restaurant: req?.params?.restaurantId
        }).populate('restaurant').populate('user');

        return res.status(200).send({
            status: 200,
            message: "Reviews found!",
            data: reviews
        });
    } catch (error) {
        return res.status(error?.status ? error?.status : 400).send({
            status: 400,
            message: error?.error ? error?.error : "Error found!"
        });
    }
}

exports.addReply = async (req, res) => {
    try {
        //doing validations
        const { error, value } = reviewReplysSchema.validate(req.body, {
            abortEarly: false,
        });

        if (!!error) {
            res.status(400).send({
                status: 400,
                message: error
            });
        } else {
            //getting restaurant 
            const restaurant = await restaurantModel.findOne({ user: req?.user?._id })
            .populate('menu_items')
            .populate('reviews');
            if (!!!restaurant) {
                return res.status(400).send({
                    status: 400,
                    message: "Restaurant not found!", 
                });
            } else {
                const review = await reviewsModel.findOne({
                    _id: req?.params?.id,
                    restaurant: restaurant?._id
                });

                if (!!!review) {
                    return res.status(400).send({
                        status: 400,
                        message: "Review not found!",
                    });
                } else {
                    //updating
                    await reviewsModel.updateOne(
                        {
                            _id: req?.params?.id
                        },
                        {
                            reply: req?.body?.reply
                        }
                    );

                    return res.status(200).send({
                        status: 200,
                        message: "Reply added successfully!",
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
        const orders = await reviewsModel.find({ restaurant: restaurant?._id })
            .sort(sortFilter)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('restaurant').populate('user');

        const total = await reviewsModel.countDocuments({ restaurant: restaurant?._id })

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