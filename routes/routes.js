const express = require('express');

const JwtMiddleware = require('../middlewares/jwt.middleware');
const RoleMiddleware = require('../middlewares/role.middleware');

const authController = require('../controllers/auth.controller');
const restaurantManagementController = require('../controllers/restaurant_management.controller');
const uploadController = require('../controllers/upload.controller');
const orderController = require('../controllers/order.controller');
const reviewController = require('../controllers/reviews.controller');


const router = express.Router();

router.post("/auth/login", authController.login);

router.post("/auth/register", authController.regesterUser);

router.get("/user", JwtMiddleware, RoleMiddleware(['admin', 'user', 'restaurant_owner']), authController.getUser);

// restaurant routes
router.post("/restaurant/profile", restaurantManagementController.createRestaurantProfile);

router.get("/restaurant", restaurantManagementController.getAll);

router.get("/restaurant/:id", restaurantManagementController.getOne);

router.post("/restaurant/search", restaurantManagementController?.search)

router.post("/restaurant/add-menu-items", JwtMiddleware, RoleMiddleware(['restaurant_owner']), restaurantManagementController?.addMenuItem)

router.post("/menu-items/search", JwtMiddleware, RoleMiddleware(['restaurant_owner']), restaurantManagementController?.searchMenuItem)

router.get('/menu-items/:id', JwtMiddleware, RoleMiddleware(['restaurant_owner']), restaurantManagementController?.getOneMenuItem);

router.get('/menu-items', JwtMiddleware, RoleMiddleware(['restaurant_owner']), restaurantManagementController?.getAllMenuItems);

router.put('/menu-items/:id', JwtMiddleware, RoleMiddleware(['restaurant_owner']), restaurantManagementController?.editMenuItems);

router.get("/owner-profile", JwtMiddleware, RoleMiddleware(['restaurant_owner']), restaurantManagementController.getOwnerProfile);

router.put("/owner-profile/update", JwtMiddleware, RoleMiddleware(['restaurant_owner']), restaurantManagementController.updateOwnerProfile);

router.post('/upload', JwtMiddleware, RoleMiddleware(['restaurant_owner']), uploadController.uploadImages);

router.post('/order', JwtMiddleware, RoleMiddleware(['user']), orderController.createOrder);

router.post('/order/cancel/:orderId', JwtMiddleware, RoleMiddleware(['user']), orderController.cancelOrder);

router.get('/order/:orderId', JwtMiddleware, RoleMiddleware(['user', 'admin', 'restaurant_owner']), orderController.findOne);

router.get('/order', JwtMiddleware, RoleMiddleware(['restaurant_owner']), orderController.findAll);

router.get('/my-order', JwtMiddleware, RoleMiddleware(['user']), orderController.findUserOrder);

router.post('/order/cancel/:orderId', JwtMiddleware, RoleMiddleware(['user']), orderController.cancelOrder);

router.post('/review', JwtMiddleware, RoleMiddleware(['user']), reviewController.create);

router.patch('/review/:reviewId', JwtMiddleware, RoleMiddleware(['user']), reviewController.edit);

router.delete('/review/:reviewId', JwtMiddleware, RoleMiddleware(['user']), reviewController.delete);

router.get('/review', JwtMiddleware, RoleMiddleware(['restaurant_owner']), reviewController.findAll)

router.get('/review/:restaurantId', JwtMiddleware, RoleMiddleware(['user', 'admin', 'restaurant_owner']), reviewController.getReviewByResaturant);

router.post('/review/add-reply/:id', JwtMiddleware, RoleMiddleware(['user', 'admin', 'restaurant_owner']), reviewController.addReply);



module.exports = router;