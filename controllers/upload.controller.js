const multer = require('multer');
const path = require('path');
const RestaurantModel = require('../models/restaurant');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Images only!'));
    }
}

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },  // 5MB limit per file
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).array('images', 10);

exports.uploadImages = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        if (req.files.length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        let imageUrls = [];

        req?.files?.map((f) => {
            imageUrls.push(f?.path)
        });

        //get restaurant details
        const restaurant = await RestaurantModel.findOne({ user: req?.user?._id });
        console.log(imageUrls)
        let payload = {
            image_urls: [...imageUrls, ...restaurant?.image_urls]
        }

        //updating in restaurant
        await RestaurantModel.updateOne({ user: req?.user?._id }, payload)

        res.status(200).json({
            message: 'Images uploaded successfully!',
            status: 200
        });
    });
};