const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const Products = require("../models/productModel");
const order = require("../models/orderModel");
const sms = require("../middleware/smsValidation");
const banner = require("../models/bannerModel");
const Category = require("../models/categoryModel");
const address = require("../models/addressModel");
const coupon = require("../models/couponModel");
const RazorPay = require("razorpay");
require("dotenv").config();

//User Registration
const loadRegister = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    res.render("userRegistration", { user: req.session.use });
  } catch (error) {
    console.log(error.message);
  }
};

let user;
const loadOtp = async (req, res) => {
  const verify = await User.findOne({
    $or: [{ phoneNumber: req.body.mno }, { email: req.body.email }],
  });
  if (verify) {
    console.log(verify);
    res.render("userRegistration", {
      user: req.session.user,
      message: "user already exists!",
    });
  } else {
    const spassword = await bcrypt.hash(req.body.password, 10);
    user = new User({
      name: req.body.name,
      email: req.body.email,
      phoneNumber: req.body.mno,
      password: spassword,
      isAdmin: 0,
    });
    // newOtp = 1234;

    newOtp = sms.sendMessage(req.body.mno, res);
    console.log(newOtp);
    res.render("otpPage", { otp: newOtp, mobno: req.body.mno });
  }
};
const againOtp = async (req, res) => {
  try {
    // newOtp = 1234;
    newOtp = sms.sendMessage(req.body.phonenumber, res);
    console.log(newOtp);
    res.send({ newOtp });
  } catch (error) {
    error.message;
  }
};

const verifyOtp = async (req, res) => {
  try {
    if (req.body.sendotp == req.body.otp) {
      const userData = await user.save();
      if (userData) {
        res.render("userRegistration", {
          user: req.session.user,
          message: "registered successfully",
        });
      } else {
        res.render("userRegistration", {
          user: req.session.user,
          message: "registration failed!!",
        });
      }
    } else {
      console.log("otp not match");
      res.render("userRegistration", {
        user: req.session.user,
        message: "incorrect otp",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//OTP verifying
const loadVerifyOTP = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    const phoneNumber = req.body.phoneNumber;
    res.render("userOTPverification", { phoneNumber, otp });
  } catch (error) {
    console.log(error.message);
  }
};

const insertOTP = async (req, res) => {
  try {
    const enteredOTP = req.body.otp;
    const phoneNumber = req.body.phoneNumber;
    if (enteredOTP === otp) {
      res.render("userLogin");
    } else {
      res.render("userOTPverification", {
        phoneNumber,
        message: "Invalid OTP is Enetered. Please enter the correct OTP",
        otp,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//User Login
const loadLogin = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    res.render("userLogin");
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email, isAdmin: 0 });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        if (userData.isBlocked == 0) {
          const product = await Products.find();
          console.log(product);
          const category = await Category.find();
          const banners = await banner.findOne({ is_active: 1 });
          const userid = req.body.userDataid;
          const username = req.body.userDataname;
          req.session.user_id = userData._id;
          req.session.user = userData.name;
          req.session.user1 = true;
          res.render("userHomeLogin", {
            user: req.session.user,
            products: product,
            categories: category,
            banner: banners,
          });
        } else {
          res.render("userLogin", {
            message: "you are blocked by administrator",
            user: req.session.user,
          });
        }
      } else {
        res.render("userLogin", {
          message: "email and password are incorrect",
          user: req.session.user,
        });
      }
    } else {
      res.render("userLogin", {
        message: "email and password are incorrect",
        user: req.session.user,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const twoFactor = async (req, res) => {
  try {
    if (req.query.id == req.body.otp) {
      const product = await Products.find();
      const category = await Category.find();
      const banners = await banner.findOne({ is_active: 1 });
      const userid = req.body.userDataid;
      const username = req.body.userDataname;
      req.session.user_id = userid;
      req.session.user = username;
      req.session.user1 = true;
      res.render("userHomeLogin", {
        user: req.session.user,
        products: product,
        categories: category,
        banner: banners,
      });
    } else {
      res.render("userLogin", {
        message: "incorrect otp!",
        user: req.session.user,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//user Home
const loadHome = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    const products = await Products.find();
    const category = await Category.find();
    const banners = await banner.findOne({ is_active: 1 });
    res.render("userHome", {
      products: products,
      categories: category,
      banner: banners,
    });
    res.sendFile("")
  } catch (error) {
    console.log(error.message);
  }
};

const loadHomeLogin = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    const userData = await User.findById({ _id: req.session.user_id });
    const products = await Products.find();
    console.log(products);
    const category = await Category.find();
    const banners = await banner.findOne({ is_active: 1 });

    res.render("userHomeLogin", {
      user: userData,
      products: products,
      categories: category,
      banner: banners,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//user Logout
const userLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};
const loadShop = async (req, res) => {
  try {
    const categoryData = await Category.find();
    let { search, sort, category, limit, page, ajax } = req.query;
    if (!search) {
      search = "";
    }
    skip = 0;
    if (!limit) {
      limit = 15;
    }
    if (!page) {
      page = 0;
    }
    skip = page * limit;
    let arr = [];
    if (category) {
      for (i = 0; i < category.length; i++) {
        arr = [...arr, categoryData[category[i]].categoryName];
      }
    } else {
      category = [];
      arr = categoryData.map((x) => x.categoryName);
    }
    if (sort == 0) {
      productData = await Products.find({
        $and: [
          { category: arr },
          {
            $or: [
              { name: { $regex: "" + search + ".*" } },
              { category: { $regex: ".*" + search + ".*" } },
            ],
          },
        ],
      }).sort({ $natural: -1 });
      pageCount = Math.floor(productData.length / limit);
      if (productData.length % limit > 0) {
        pageCount += 1;
      }
      productData = await Products.find({
        $and: [
          { category: arr },
          {
            $or: [
              { name: { $regex: "" + search + ".*" } },
              { category: { $regex: ".*" + search + ".*" } },
            ],
          },
        ],
      })
        .sort({ $natural: -1 })
        .skip(skip)
        .limit(limit);
    } else {
      productData = await Products.find({
        $and: [
          { category: arr },
          {
            $or: [
              { name: { $regex: "" + search + ".*" } },
              { category: { $regex: ".*" + search + ".*" } },
            ],
          },
        ],
      }).sort({ price: sort });
      pageCount = Math.floor(productData.length / limit);
      if (productData.length % limit > 0) {
        pageCount += 1;
      }
      console.log(productData.length + " results found " + pageCount);
      productData = await Products.find({
        $and: [
          { category: arr },
          {
            $or: [
              { name: { $regex: "" + search + ".*" } },
              { category: { $regex: ".*" + search + ".*" } },
            ],
          },
        ],
      })
        .sort({ price: sort })
        .skip(skip)
        .limit(limit);
    }
    if (req.session.user) {
      session = req.session.user;
    } else session = false;
    if (pageCount == 0) {
      pageCount = 1;
    }
    if (ajax) {
      console.log(pageCount);
      res.json({ product: productData, pageCount, page });
    } else {
      const productsData = await Products.find();
      res.render("shop", {
        user: session,
        product: productsData,
        category: categoryData,
        val: search,
        selected: category,
        order: sort,
        limit: limit,
        pageCount,
        page,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadCheckout = async (req, res) => {
  try {
    const couponData = await coupon.find();
    const userData = req.session.user_id;
    const addresss = await address.find({ userId: userData });
    const userDetails = await User.findById({ _id: userSession });
    const completeUser = await userDetails.populate("cart.item.productId");
    res.render("checkout", {
      user: req.session.user,
      address: addresss,
      checkoutdetails: completeUser.cart,
      coupon: couponData,
      discount: req.query.coupon,
      wallet: userDetails.wallet,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const applyCoupon = async (req, res) => {
  try {
    const totalPrice = req.body.totalValue;
    userdata = await User.findById({ _id: req.session.user_id });
    offerdata = await coupon.findOne({ name: req.body.coupon });

    if (offerdata) {
      console.log(offerdata.expiryDate, Date.now());
      const date1 = new Date(offerdata.expiryDate);
      const date2 = new Date(Date.now());
      if (date1.getTime() > date2.getTime()) {
        if (offerdata.usedBy.includes(req.session.user_id)) {
          messag = "coupon already used";
        } else {
          if (userdata.cart.totalPrice >= offerdata.minimumvalue) {
            console.log("COMMING");
            console.log("offerdata.name");
            await coupon.updateOne(
              { name: offerdata.name },
              { $push: { usedBy: userdata._id } }
            );
            console.log("kskdfthg");
            disc = (offerdata.discount * totalPrice) / 100;
            if (disc > offerdata.maximumvalue) {
              disc = offerdata.maximumvalue;
            }
            res.send({ offerdata, disc, state: 1 });
          } else {
            messag = "cannot apply";
            res.send({ messag, state: 0 });
          }
        }
      } else {
        messag = "coupon Expired";
        res.send({ messag, state: 0 });
      }
    } else {
      messag = "coupon not found";
      res.send({ messag, state: 0 });
    }
    res.send({ messag, state: 0 });
  } catch (error) {
    console.log(error.message);
  }
};

//user Profile Edit
const loadUserProfile = async (req, res) => {
  try {
    const usid = req.session.user_id;
    const user = await User.findOne({ _id: usid });
    const adid = await address.find({ userId: usid });
    const addressData = await address.find({ userId: usid });

    const orderData = await order
      .find({ userId: usid })
      .sort({ createdAt: -1 })
      .populate("products.item.productId");
    res.render("profile", {
      user: req.session.user,
      userAddress: adid,
      userData: user,
      address: addressData,
      order: orderData,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const loadProfileEdit = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findById({ _id: id });
    res.set("Cache-Control", "no-store");
    if (userData) {
      res.render("userProfileEdit", { user: userData });
    } else {
      res.redirect("/home");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const editUser = async (req, res) => {
  try {
    const currentUser = req.session.user_id;
    const findUser = await User.findOne({ _id: currentUser });
    res.render("editUser", { user: findUser });
  } catch (error) {
    console.log(error.message);
  }
};
const editUserUpdate = async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      { _id: req.body.id },
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
          phoneNumber: req.body.number,
        },
      }
    );
    res.redirect("/userProfile");
  } catch (error) {
    console.log(error.message);
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userData = await User.findByIdAndUpdate(
      { _id: req.body.user_id },
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
          phoneNumber: req.body.phoneNumber,
        },
      }
    );
    if (userData) {
      // res.redirect("/home")
      res.render("userProfileEdit", {
        message: "Successfully Updated Your Profile",
        user: userData,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadDetails = async (req, res) => {
  try {
    const id = req.query.id;
    const details = await Products.findOne({ _id: id });
    const products = await Products.find();
    const product = await Products.find({ category: details.category });
    res.render("details", {
      user: req.session.user,
      detail: details,
      products: products,
      related: product,
      message: "",
    });
  } catch (error) {
    console.log(error.message);
  }
};

const loadOrderSuccess = async (req, res) => {
  try {
    Norder.payment.method = "Online";
    Norder.paymentDetails.reciept = paymentDetails.receipt;
    Norder.paymentDetails.status = paymentDetails.status;
    Norder.paymentDetails.createdAt = paymentDetails.created_at;
    let minuswalAmt = await User.updateOne(
      { _id: req.session.user_id },
      { $set: { wallet: 0 } }
    );
    await Norder.save();
    await User.updateOne({ _id: req.session.user_id }, { $unset: { cart: 1 } });
    const data = req.session.totalWallet;
    res.render("orderSuccess", { user: req.session.user });
  } catch (error) {
    console.log(error.message);
  }
};
const addNewAddress = async (req, res) => {
  try {
    userSession = req.session;
    const nAddress = new address({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      country: req.body.country,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
      mobile: req.body.mno,
      userId: userSession.user_id,
    });
    const newAddress = await nAddress.save();
    if (newAddress) {
      res.redirect("/userProfile");
    }
  } catch (error) {}
};

const deleteAddress = async (req, res) => {
  try {
    const id = req.query.id;
    const Address = await address.deleteOne({ _id: id });
    if (Address) {
      res.redirect("/userProfile");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const editAddress = async (req, res) => {
  try {
    const id = req.query.id;
    const addres = await address.findOne({ _id: id });
    res.render("editaddress", { user: req.session.user, address: addres });
  } catch (error) {
    console.log(error.message);
  }
};

const editUpdateAddress = async (req, res) => {
  try {
    const id = req.body.id;
    const upadteAddres = await address.updateOne(
      { _id: id },
      {
        $set: {
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          country: req.body.country,
          address: req.body.address,
          city: req.body.city,
          zip: req.body.zip,
          mobile: req.body.mno,
        },
      }
    );
    res.redirect("/userProfile");
  } catch (error) {
    console.log(error.message);
  }
};

const editCheckoutAddress = async (req, res) => {
  try {
    const id = req.query.id;
    const addressData = await address.findById({ _id: id });
    res.render("editCheckoutAddress", {
      user: req.session.user,
      address: addressData,
    });
  } catch (error) {
    console.log(error.message);
  }
};
const editUpdateCheckoutAddress = async (req, res) => {
  try {
    const id = req.body.id;
    const upadteAddres = await address.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          country: req.body.country,
          address: req.body.address,
          city: req.body.city,
          zip: req.body.zip,
          mobile: req.body.mno,
        },
      }
    );
    res.redirect("/loadCheckout");
  } catch (error) {
    console.log(error.message);
  }
};

const deleteCheckoutAddress = async (req, res) => {
  try {
    const id = req.query.id;
    const deleteAddress = await address.findByIdAndDelete({ _id: id });
    res.redirect("/loadCheckout");
  } catch (error) {}
};
let Norder;
const placeOrder = async (req, res) => {
  try {
    let nAddress;
    if (req.body.address == 0) {
      nAddress = new address({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        country: req.body.country,
        address: req.body.details,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
        mobile: req.body.mno,
      });
    } else {
      nAddress = await address.findOne({ _id: req.body.address });
    }
    const userData = await User.findOne({ _id: req.session.user_id });

    Norder = new order({
      userId: req.session.user_id,
      address: nAddress,
      payment: {
        method: req.body.payment,
        amount: req.body.amount,
      },
      offer: req.body.coupon,
      products: userData.cart,
    });
    if (req.body.payment == "COD") {
      await Norder.save();
      const productData = await Products.find();
      for (let key of userData.cart.item) {
        for (let prod of productData) {
          if (
            new String(prod._id).trim() == new String(key.productId._id).trim()
          ) {
            prod.quantity = prod.quantity - key.qty;
            await prod.save();
          }
        }
      }
      await User.updateOne(
        { _id: req.session.user_id },
        { $unset: { cart: 1 } }
      );
      res.render("orderSuccess", { user: req.session.user });
    } else {
      var instance = new RazorPay({
        key_id: process.env.key_id,
        key_secret: process.env.key_secret,
      });

      let razorpayOrder = await instance.orders.create({
        amount: req.body.amount * 100,
        currency: "INR",
        receipt: Norder._id.toString(),
      });
      paymentDetails = razorpayOrder;

      const productData = await Products.find();
      for (let key of userData.cart.item) {
        for (let prod of productData) {
          if (
            new String(prod._id).trim() == new String(key.productId._id).trim()
          ) {
            prod.quantity = prod.quantity - key.qty;
            await prod.save();
          }
        }
      }
      res.render("confirmPayment", {
        userId: req.session.user_id,
        order_id: razorpayOrder.id,
        total: req.body.amount,
        session: req.session,
        key_id: process.env.key_id,
        user: userData,
        orders: Norder,
        orderId: Norder._id.toString(),
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const viewOrderDetails = async (req, res) => {
  try {
    const id = req.query.id;
    const users = req.session.user_id;
    const orderDetails = await order.findById({ _id: id });
    const addres = await address.findById({ _id: users });
    await orderDetails.populate("products.item.productId");
    res.render("viewOrderDetails", {
      user: req.session.user,
      orders: orderDetails,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const cancelOrder = async (req, res) => {
  try {
    const id = req.query.id;
    const orderDetails = await order.findById({ _id: id });
    let state = "cancelled";
    await order.findByIdAndUpdate(
      { _id: id },
      { $set: { status: "cancelled" } }
    );
    if (state == "cancelled") {
      const productData = await Products.find();
      const orderData = await order.findById({ _id: id });

      for (let key of orderData.products.item) {
        for (let prod of productData) {
          console.log(key.productId);
          if (new String(prod._id).trim() == new String(key.productId).trim()) {
            prod.quantity = prod.quantity + key.qty;
            await prod.save();
          }
        }
      }
    }

    res.redirect("/userProfile");
  } catch (error) {
    console.log(error.message);
  }
};

const retunOrder = async (req, res) => {
  try {
    const id = req.query.id;
    const users = req.session.user_id;
    const orderDetails = await order.findById({ _id: id });
    const addres = await address.findById({ _id: users });
    const cancel = await order.findByIdAndUpdate(
      { _id: id },
      { $set: { status: "returned" } }
    );
    await orderDetails.populate("products.item.productId");
    let state = "returned";
    if (state == "returned") {
      const productData = await Products.find();
      const orderData = await order.findById({ _id: id });
      for (let key of orderData.products.item) {
        for (let prod of productData) {
          if (new String(prod._id).trim() == new String(key.productId).trim()) {
            prod.quantity = prod.quantity + key.qty;
            await prod.save();
          }
        }
      }
    }
    res.redirect("/userProfile");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadRegister,
  loadOtp,
  loadVerifyOTP,
  insertOTP,
  loadLogin,
  verifyLogin,
  loadHome,
  loadShop,
  loadCheckout,
  applyCoupon,
  loadOrderSuccess,
  loadHomeLogin,
  userLogout,
  addNewAddress,
  deleteAddress,
  editAddress,
  editUpdateAddress,
  editCheckoutAddress,
  editUpdateCheckoutAddress,
  deleteCheckoutAddress,
  placeOrder,
  cancelOrder,
  retunOrder,
  viewOrderDetails,
  loadUserProfile,
  editUser,
  editUserUpdate,
  loadProfileEdit,
  updateUserProfile,
  loadDetails,
  twoFactor,
  againOtp,
  verifyOtp,
};
