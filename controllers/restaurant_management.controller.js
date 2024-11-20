const RestaurantModel = require('../models/restaurant');
const UserModel = require('../models/user');
const MenuItemsModel = require('../models/menu-items');
const createRestaurantProfileSchema = require('../validators/restaurant.validator');
const createMenuItemSchema = require('../validators/create.menuItem. validator');
const bcrypt = require("bcryptjs");
const { filterMapper } = require('../utils/filter.mapper');
const { orderMapper } = require('../utils/order.mapper');

exports.createRestaurantProfile = async (req, res) => {
    try {
        //doing validations
        const { error, value } = createRestaurantProfileSchema.validate(req.body, {
            abortEarly: false,
        });

        if (!!error) {
            res.status(400).send({
                status: 400,
                message: error
            });
        } else {
            //checking opening & closing time if 24 hour is false
            if (!req?.body?.is24Hours && (!!!req?.body?.opening_time || !!!req?.body?.closing_time)) {
                res.status(400).send({
                    status: 400,
                    message: "Opening & Closing time is required"
                });
            } else {
                //checking email is already present
                const checkEmail = await UserModel.findOne({ email: req?.body?.email });
                if (!!checkEmail) {
                    res.status(400).send({
                        status: 400,
                        message: "Email is already present"
                    });
                } else {
                    let errs = false;

                    //checking for proper enum values or not
                    for (let i = 0; i < req?.body?.days_of_operation?.length; i++) {
                        if (!!![
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                            "Sunday"
                        ].includes(req?.body?.days_of_operation?.[i])) {
                            errs = true;
                        }
                    }

                    if (errs) {
                        return res.status(400).send({
                            status: 400,
                            message: `Days of Operation should be poper in this form!, "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"`,
                        });
                    } else {
                        //inserting in user
                        let userPayload = {
                            name: req?.body?.name,
                            email: req?.body?.email,
                            password: req?.body?.password,
                            mobile_number: req?.body?.mobile_number,
                            role: "restaurant_owner"
                        };

                        // hash the password
                        const salt = await bcrypt.genSalt(+process.env.HASH);
                        const hashedPassword = await bcrypt.hash(userPayload.password, salt);
                        userPayload.password = hashedPassword;

                        // create user
                        const user = await UserModel.create(userPayload);


                        //inserting in restaurant management 
                        let restaurantPayload = {
                            restaurant_name: req?.body?.restaurant_name,
                            location: req?.body?.location,
                            days_of_operation: req?.body?.days_of_operation,
                            is24Hours: req?.body?.is24Hours,
                            opening_time: req?.body?.opening_time,
                            closing_time: req?.body?.closing_time,
                            party_size: req?.body?.party_size,
                            image_urls: req?.body?.image_urls,
                            user: user?._id,
                            live_music: req?.body?.live_music,
                            outdoor_seating: req?.body?.outdoor_seating,
                            pet_friendly: req?.body?.pet_friendly,
                            vegan_options: req?.body?.vegan_options,
                            wifi: req?.body?.wifi,
                        }
                        const restaurant = await RestaurantModel.create(restaurantPayload);

                        //updating restaurant in user 
                        await UserModel.updateOne({ _id: user?._id }, { restaurant: restaurant?._id })

                        return res.status(200).send({
                            status: 200,
                            message: "Restaurant profile created successfully, please login!",
                        });
                    }
                }
            }
        }
    } catch (error) {
        console.log({ error })
        return res.status(error?.status ? error?.status : 400).send({
            status: 400,
            message: error?.error ? error?.error : "Error found!"
        });
    }
}

exports.getOne = async (req, res) => {
    try {
        const restaurant = await RestaurantModel.findById(req?.params?.id).populate('user').populate('menu_items').populate({
            path: 'reviews',
            populate: {
                path: 'user'
            }
        });

        if (!!!restaurant) {
            res.status(400).send({
                status: 400,
                message: "Invalid Restaurant"
            });
        } else {
            return res.status(200).send({
                status: 200,
                data: restaurant,
                message: "Restaurant found successfully!",
            });
        }
    } catch (error) {
        console.log({ error })
        return res.status(error?.status ? error?.status : 400).send({
            status: 400,
            message: error?.error ? error?.error : "Error found!"
        });
    }
}

exports.getAll = async (req, res) => {
    try {
        const restaurant = await RestaurantModel.find().populate('user').populate('menu_items').populate({
            path: 'reviews',
            populate: {
                path: 'user'
            }
        });

        return res.status(200).send({
            status: 200,
            data: restaurant,
            message: "Restaurants found successfully!",
        });
    } catch (error) {
        console.log({ error })
        return res.status(error?.status ? error?.status : 400).send({
            status: 400,
            message: error?.error ? error?.error : "Error found!"
        });
    }
}


exports.search = async (req, res) => {
    try {
        //search parameter 
        const search = req?.body?.filter?.search;
        const search_by = req?.body?.filter?.search_by;
        const additionalFilterKey = req?.body?.filter?.additional_filter;


        //adding search fields
        let filter = (!!search && !!search_by) ? filterMapper(req?.body?.filter) : {};

        //manually setting querry for nested search
        if (search_by?.split(',')?.includes("menu_items.name")) {
            const menuItems = await MenuItemsModel.find({
                name: { $regex: search, $options: 'i' }
            });

            const restaurantIds = menuItems.map(item => item.restaurant);
            if (restaurantIds?.length > 0) {
                filter = {
                    $or: [
                        { _id: { $in: restaurantIds } },
                        filter
                    ]
                }
            }
        }

        //checking for addtional filters
        if (!!additionalFilterKey) {
            filter = {
                $or: [
                    { [additionalFilterKey]: true },
                    filter
                ]
            }
        }

        //sorting 
        const sortFilter = orderMapper(req?.query);

        //pagination parameter
        const skip = (+req?.query.page * +req?.query.per_page) - +req?.query.per_page || 0;
        const limit = req?.query.per_page || 10;


        let data = await RestaurantModel.find(filter)
            .sort(sortFilter)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('user')
            .populate('menu_items')
            .populate({
                path: 'reviews',
                populate: {
                    path: 'user'
                }
            });

        const totalRecords = await RestaurantModel.countDocuments(filter);


        return res.status(200).send({
            status: 200,
            message: "Restaurants found!",
            data: data,
            pagination: {
                page: +req?.query.page,
                per_page: +req?.query.per_page,
                total: totalRecords
            }
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


exports.addMenuItem = async (req, res) => {
    try {
        //doing validations
        const { error, value } = createMenuItemSchema.validate(req.body, {
            abortEarly: false,
        });

        if (!!error) {
            res.status(400).send({
                status: 400,
                message: error
            });
        } else {
            //getting restaurant 
            const restaurant = await RestaurantModel.findOne({ user: req?.user?._id }).populate('menu_items');

            //inserting in menu items 
            let menuItemPayload = {
                name: req?.body?.name,
                price: req?.body?.price,
                restaurant: restaurant?._id
            }
            const menuItem = await MenuItemsModel.create(menuItemPayload);

            const oldMenuItems = [];
            restaurant?.menu_items?.map((o) => {
                oldMenuItems.push(o?._id)
            })
            //updating in restaurants
            const restaurantPayload = {
                menu_items: [...oldMenuItems, menuItem?._id]
            }
            await RestaurantModel.updateOne({ _id: restaurant?._id }, restaurantPayload)

            return res.status(200).send({
                status: 200,
                message: "Menu Item created successfully!",
                // data: menuItemPayload
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


exports.searchMenuItem = async (req, res) => {
    try {
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

        let data = await MenuItemsModel.find(filter)
            .sort(sortFilter)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('restaurant');

        const total = await MenuItemsModel.countDocuments(filter)

        return res.status(200).send({
            status: 200,
            message: "Menu Items found!",
            data: data,
            pagination: {
                page: +skip + 1,
                per_page: +limit,
                total: +total
            }
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

exports.getOneMenuItem = async (req, res) => {
    try {
        const restaurant = await MenuItemsModel.findById(req?.params?.id).populate('restaurant');

        if (!!!restaurant) {
            res.status(400).send({
                status: 400,
                message: "Invalid Restaurant"
            });
        } else {
            return res.status(200).send({
                status: 200,
                data: restaurant,
                message: "Menu Item found successfully!",
            });
        }
    } catch (error) {
        console.log({ error })
        return res.status(error?.status ? error?.status : 400).send({
            status: 400,
            message: error?.error ? error?.error : "Error found!"
        });
    }
}

exports.getAllMenuItems = async (req, res) => {
    try {
        const restaurant = await MenuItemsModel.find().populate('restaurant');

        return res.status(200).send({
            status: 200,
            data: restaurant,
            message: "Menu Item found successfully!",
        });
    } catch (error) {
        console.log({ error })
        return res.status(error?.status ? error?.status : 400).send({
            status: 400,
            message: error?.error ? error?.error : "Error found!"
        });
    }
}

exports.editMenuItems = async (req, res) => {
    try {

        //doing validations
        const { error, value } = createMenuItemSchema.validate(req.body, {
            abortEarly: false,
        });

        if (!!error) {
            res.status(400).send({
                status: 400,
                message: error
            });
        } else {
            const restaurant = await MenuItemsModel.findById(req?.params?.id).populate('restaurant');

            if (!!!restaurant) {
                res.status(400).send({
                    status: 400,
                    message: "Invalid Restaurant"
                });
            } else {
                //updating
                await MenuItemsModel.updateOne({ _id: req?.params?.id }, {
                    name: req?.body?.name,
                    price: req?.body?.price
                });

                return res.status(200).send({
                    status: 200,
                    message: "Menu Item updated successfully!",
                });
            }
        }
    } catch (error) {
        console.log({ error })
        return res.status(error?.status ? error?.status : 400).send({
            status: 400,
            message: error?.error ? error?.error : "Error found!"
        });
    }
}


exports.getOwnerProfile = async (req, res) => {
    try {
        const restaurant = await RestaurantModel.findOne({ user: req?.user?._id }).populate('user').populate('menu_items');

        if (!!!restaurant) {
            res.status(400).send({
                status: 400,
                message: "Invalid Restaurant"
            });
        } else {
            return res.status(200).send({
                status: 200,
                data: restaurant,
                message: "Restaurant found successfully!",
            });
        }
    } catch (error) {
        console.log({ error })
        return res.status(error?.status ? error?.status : 400).send({
            status: 400,
            message: error?.error ? error?.error : "Error found!"
        });
    }
}

exports.updateOwnerProfile = async (req, res) => {
    try {
        const restaurant = await RestaurantModel.findOne({ user: req?.user?._id }).populate('user').populate('menu_items');

        if (!!!restaurant) {
            res.status(400).send({
                status: 400,
                message: "Invalid Restaurant"
            });
        } else {

            //updating in user
            let userPayload = {
                name: req?.body?.name,
                email: req?.body?.email,
                mobile_number: req?.body?.mobile_number
            };

            await UserModel.updateOne({ _id: req?.user?._id }, userPayload);


            //inserting in restaurant management 
            let restaurantPayload = {
                restaurant_name: req?.body?.restaurant_name,
                location: req?.body?.location,
                days_of_operation: req?.body?.days_of_operation,
                is24Hours: req?.body?.is24Hours,
                opening_time: req?.body?.opening_time,
                closing_time: req?.body?.closing_time,
                party_size: req?.body?.party_size,
                live_music: req?.body?.live_music,
                outdoor_seating: req?.body?.outdoor_seating,
                pet_friendly: req?.body?.pet_friendly,
                vegan_options: req?.body?.vegan_options,
                wifi: req?.body?.wifi
            }

            await RestaurantModel.updateOne({ user: req?.user?._id }, restaurantPayload);

            return res.status(200).send({
                status: 200,
                message: "Profile updated successfully!",
            });
        }
    } catch (error) {
        console.log({ error })
        return res.status(error?.status ? error?.status : 400).send({
            status: 400,
            message: error?.error ? error?.error : "Error found!"
        });
    }
}