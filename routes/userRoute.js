const express = require("express");
const userRoute = express();
const session = require("express-session");
const moment = require('moment');
const config = require("../config/config");
const auth =require("../middleware/auth")
const userController = require("../controllers/userController")
const cartController=require("../controllers/cartController");
const wishlistController=require("../controllers/wishlistController")
const errorHandler = require('../middleware/errorHandler');

userRoute.use(session({ 
    secret: config.sessionSecret,
    resave:false,
    saveUninitialized:true,    
}));



userRoute.set("views", "./views/users");

userRoute.get("/login",userController.loadLogin);

userRoute.get("/register",userController.loadRegister);

userRoute.get("/login", auth.isLogout, userController.loadLogin);

userRoute.post("/login", userController.verifyLogin);

userRoute.post("/verifytwofact",userController.twoFactor)

userRoute.get("/register", auth.isLogout, userController.loadRegister);

userRoute.post("/register", userController.loadOtp);

userRoute.post("/againotp",userController.againOtp);

userRoute.post("/otpPage",userController.verifyOtp)

userRoute.get("/",auth.isLogout,userController.loadHome)

userRoute.use(auth.isLogin);

userRoute.get("/home",auth.isLogin,userController.loadHomeLogin)

userRoute.get("/logout",userController.userLogout);


userRoute.get("/loadShop",userController.loadShop)

userRoute.get("/loadCart",cartController.loadCart);

userRoute.get("/addToCart",cartController.addToCart);

userRoute.post("/updateCart",cartController.updateCart);

userRoute.get('/delete-cart',cartController.deleteCart)

userRoute.get("/loadWishlist",auth.isLogin,wishlistController.loadWishlist);

userRoute.get("/addWishlist",wishlistController.addWishlist);

userRoute.get("/deleteWishlist",wishlistController.deleteWishlist)

userRoute.get("/loadCheckout",userController.loadCheckout);

userRoute.post("/applyCoupon",userController.applyCoupon);

userRoute.get("/adCartremoveWishlist",wishlistController.addToCartremovefromwishlist)

userRoute.get("/userProfile",userController.loadUserProfile);

userRoute.post("/addAddress",userController.addNewAddress);

userRoute.get("/delete-address",userController.deleteAddress);

userRoute.get("/edit-address",userController.editAddress);

userRoute.post("/edit-address",userController.editUpdateAddress);

userRoute.get("/editcheckout-address",userController.editCheckoutAddress);

userRoute.post("/editcheckout-address",userController.editUpdateCheckoutAddress);

userRoute.get("/deletecheckout-address",userController.deleteCheckoutAddress)

userRoute.post("/orderSuccess",userController.placeOrder);

userRoute.get("/vieworder",userController.viewOrderDetails)

userRoute.get("/cancelorder",userController.cancelOrder);

userRoute.get("/returnOrder",userController.retunOrder);

userRoute.get("/updateProfile",auth.isLogin,userController.loadProfileEdit)

userRoute.post("/updateProfile",userController.updateUserProfile)

userRoute.get("/editUser",userController.editUser);

userRoute.post("/editUser",userController.editUserUpdate);

userRoute.get("/view-details",userController.loadDetails);

userRoute.get("/onlinePayment",userController.loadOrderSuccess);


// userRoute.use(errorHandler);

module.exports = userRoute