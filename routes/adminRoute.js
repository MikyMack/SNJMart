const express = require("express");
const adminRoute = express();
const session = require("express-session");
const auth = require("../middleware/adminAuth");
const config = require("../config/config");
const adminController = require("../controllers/adminController")
const bannerController=require("../controllers/bannerController");
const couponController=require("../controllers/couponController");
const multer =require("../middleware/multer")
const errorHandler = require('../middleware/errorHandler');

// adminRoute.use(session({ 
//     secret: config.sessionSecret,
//     resave:false,
//     saveUninitialized:true, 
// }));


adminRoute.set("views", "./views/admin")

adminRoute.use(express.static('public'));

adminRoute.get("/", auth.isLogout, adminController.loadAdminLogin)

adminRoute.post("/", adminController.verifyLogin)

adminRoute.get("/adminLogout", auth.isLogin, adminController.adminLogout)

adminRoute.use(auth.isLogin);

adminRoute.get("/home",  adminController.loadDashboard)

adminRoute.get("/user",  adminController.loadUser)

adminRoute.post("/user/unblock/:id",  adminController.unblockUser)

adminRoute.get('/block-user',adminController.BlockUser)

adminRoute.get("/banner",bannerController.loadBanner);

adminRoute.get("/add-Banners",bannerController.loadAddBanner);

adminRoute.post("/add-Banners",multer.upload.array('bImage',3),bannerController.addBanner);

adminRoute.get("/hide-banner",bannerController.hideBanner)

adminRoute.get("/edit-banner",bannerController.editBanner);

adminRoute.post("/edit-banner",multer.upload.array('bImage',3),bannerController.editModifyBanner);

adminRoute.get("/loadCoupon",couponController.loadCoupon);

adminRoute.get("/addCoupon",couponController.addCoupon);

adminRoute.post("/addCoupon",couponController.addNewCoupon);

adminRoute.get("/avail-coupon",couponController.availCoupon);

adminRoute.get("/edit-coupon",couponController.editCoupon);

adminRoute.post("/edit-coupon",couponController.editUpdateCoupon);

adminRoute.get("/delete-coupon",couponController.deleteCoupon);

adminRoute.get("/products",  adminController.loadProducts)

adminRoute.get("/products/addProducts",  adminController.loadAddProducts)

adminRoute.post("/products/addProducts",multer.upload.array("images"), adminController.insertProduct)

adminRoute.get("/products/editProduct/:product_id",  adminController.loadEditProduct)

adminRoute.post("/products/editProduct/:product_id", multer.upload.array("images"), adminController.updateProduct)

adminRoute.post("/products/deleteProduct/:product_id",  adminController.deleteProduct)

adminRoute.post("/products/recoverProduct/:product_id", adminController.recoverProduct)

adminRoute.get("/category",  adminController.loadCategory)

adminRoute.get("/category/addCategories",adminController.loadAddCategory)

adminRoute.post("/category/addCategories",multer. upload.single("categoryImages"), adminController.insertCategory)

adminRoute.get('/delete-category',adminController.deleteCategory);

adminRoute.get('/edit-category',adminController.editCategory);

adminRoute.post('/edit-category',adminController.editUpdateCategory)

adminRoute.get('/order', adminController.loadOrder);

adminRoute.get("/loadOrderDetails",adminController.viewOrderDetails)

adminRoute.post('/updateOrder',adminController.sortOrder)

adminRoute.post("/updateStatus",adminController.updateStatus);

adminRoute.use(errorHandler);

module.exports = adminRoute