const User = require("../models/userModel")
const Product = require("../models/productModel")
const orders = require("../models/orderModel");
const address = require("../models/addressModel");
const category = require("../models/categoryModel")
const path = require('path');

const bcrypt = require("bcrypt");
const { findById } = require("../models/productModel");
const { log } = require("console");

//Login

const loadAdminLogin = async (req, res) => {
    try {
        res.render("adminLogin")
    } catch (error) {
        console.log(error.messsage)
    }
}



const verifyLogin = async (req, res) => {
    try {

        const phoneNumber = req.body.phoneNumber
        const password = req.body.password

        const userData = await User.findOne({ phoneNumber: phoneNumber })
        console.log('my user data'+userData);
        if (userData && userData.password === password) {

            if (userData.isAdmin === 0) {
                res.render("adminLogin", { message: "Phone Number and password are Incorrect" })
            } else {
                req.session.user_id = userData._id
                res.redirect("/admin/home")
            }
        } else {
            res.render("adminLogin", { message: "Phone Number and password are Incorrect" })
        }

    } catch (error) {
        console.log(error.messsage)
    }
}

const loadDashboard = async (req, res, next) => {
  try {
    console.log(req.session);
    const products = await Product.find();
    let pds = [];
    let qty = [];
    products.forEach((product) => {
      if (product.quantity <= 15) {
        pds.push(product.title);
        qty.push(product.quantity);
      }
    });
    const arr = [];
    const order = await orders.find().populate('products.item.productId');
    
    
    for (let orders of order) {
      for (let product of orders.products.item) {
        if (orders.status === 'Delivered'||orders.status === 'delivered'||orders.status === 'reject return') {
          const index = arr.findIndex((obj) => obj.product == product.productId.title);
          if (index !== -1) {
            arr[index].qty += product.qty;
          } else {
            arr.push({ product: product.productId.title, qty: product.qty });
          }
        }
      }
    }
    
    const key1 = [];
    const key2 = [];
    arr.forEach((obj) => {
      key1.push(obj.product);
      key2.push(obj.qty);
    });

    const sales = key2.reduce((value, number) => {
      return value + number;
    }, 0);

    let totalRevenue = 0;

    for (let orders of order) {
      if (orders.status === 'Delivered'||orders.status === 'delivered'||orders.status === 'reject return') {
        totalRevenue += orders.products.totalPrice;
      }
    }


    const userData = await User.find({ isAdmin : true });

    res.render('adminHome', { admin: userData, key1, key2, pds, qty, sales, totalRevenue });
  } catch (error) {
    next(error);
  }
};

//Logout
async function adminLogout(req, res) {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
}

//List Users
const loadUser = async (req, res) => {
    try {
      var search = "";
      if (req.query.search) {
        search = req.query.search;
      }
      const userData = await User.find({ name: { $regex: search + ".*" }, isAdmin: 0 });
      console.log(userData);
      res.render("user", { users: userData });
    } catch (error) {
      console.log(error.message);
    }
  };



//Unblock User
const unblockUser = async (req, res) => {
    try {
        const userId = req.params.id
        const user = await User.findById(userId)
        user.isBlocked = 0
        await User.save()
        res.redirect("/admin/user")
    } catch (error) {
        console.log(error.message)
    }
}

const BlockUser = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findOne({ _id: id });
    if (!userData.isBlocked) {
      await User.findByIdAndUpdate({ _id: id }, { $set: { isBlocked: 1 } }); console.log("blocked");
    }
    else { await User.findByIdAndUpdate({ _id: id }, { $set: { isBlocked: 0 } }); console.log("unblocked"); }
    res.redirect("/admin/user");
  } catch (error) {
    console.log(error);
  }
}

//Product
//list Products
async function loadProducts(req, res) {
  try {
    res.set("Cache-Control", "no-store");
    const productsData = await Product.find();
    res.render("adminProduct", { products: productsData });
  } catch (error) {
    console.log(error.message);
  }
}

//Add Products
const loadAddProducts = async (req, res) => {
    try {
        res.set("Cache-Control", "no-store")
        res.render("addProducts")
    } catch (error) {
        console.log(error.message)
    }
}

const insertProduct = async (req, res) => {
    try {
        const productTitle = req.body.title
        const productData = await Product.findOne({ title: productTitle })

        if (productData) {
            return res.render("addProducts", { message: "The Same Product Already Exists" })
        } else {
            const product = new Product({
                title: req.body.title,
                category: req.body.category,
                quantity: req.body.quantity,
                price: req.body.price,
                description: req.body.description,
                images: req.files.map((file) => file.filename),
                is_in_cart: 0,
                is_available: 0
            })
            await product.save()
            res.render("addProducts", { message: "Poduct is succesfullly Added" })
        }

    } catch (error) {
        console.log(error.message)
    }
}

//Edit Product
const loadEditProduct = async (req, res) => {
    try {
        res.set("Cache-Control", "no-store")
        const product = await Product.findById(req.params.product_id)
        console.log(product)
        res.render("editProduct", { product: product })
    } catch (error) {
        console.log(error.message)
    }
}

const updateProduct = async (req, res) => {
    try {
        const productId = req.params.product_id
        const updatedData = {
            title: req.body.title,
            category: req.body.category,
            quantity: req.body.quantity,
            price: req.body.price,
            description: req.body.description,
        }
        if (req.files && req.files.length > 0) {
            const images = req.files.map((file) => file.filename)
            updatedData.images = images
        }
        await Product.findByIdAndUpdate(productId, updatedData)
        res.redirect("/admin/products")
    } catch (error) {
        console.log(error.message)
    }
}

// const deleteProduct = async (req, res) => {
//     try {
//         const productId = req.params.product_id
//         const product = await Product.findById(productId)
//         product.is_available = 1
//         await product.save()
//         res.redirect("/admin/products")
//     } catch (error) {
//         console.log(error.message)
//     }
// }
const deleteProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await Product.findOne({ _id: id });
    if (productData.is_available) {
      await Product.findByIdAndUpdate({ _id: id }, { $set: { is_available: 0 } })
    } else {
      await Product.findByIdAndUpdate({ _id: id }, { $set: { is_available: 1 } })
    }
    res.redirect("/admin/product")
  }
  catch (error) {
    console.log(error.message);
  }
};



const recoverProduct = async (req, res) => {
    try {
        const productId = req.params.product_id
        const product = await Product.findById(productId)
        product.is_available = 0
        await product.save()
        res.redirect("/admin/products")
    } catch (error) {
        console.log(error.message)
    }
}

//Category
const loadCategory = async (req, res) => {
    try {
      var search = "";
      if (req.query.search) {
        search = req.query.search;
      }
      const categ = await category.find()
      const userData = await category.find({ name: { $regex: search + ".*" } })
      res.render("categories", { category: categ });
    } catch (error) {
      console.log(error.message);
    }
  };

const loadAddCategory = async (req, res) => {
    try {
        res.render("addCategory")
    } catch (error) {
        console.log(error.message)
    }
}
const insertCategory = async (req, res) => {
    try {
        const categoryName = req.body.categoryName;
        const categoryData = await category.findOne({ categoryName: { $regex: new RegExp(`^${categoryName}$`, 'i') } });

        if (categoryData) {
            return res.render("addCategory", { message: "The same category name already exists" });
        } else {
            const Category = new category({
                categoryName: req.body.categoryName,
                categoryDescription: req.body.categoryDescription,
                categoryImage: req.file.filename,
                is_available:true
            });
            await Category.save();
            console.log(Category);
            res.render("addCategory", { message: "Category is successfully added" });
        }
    } catch (error) {
        console.log(error.message);
        res.render("addCategory", { message: "An error occurred while adding the category"});
    }
}

const deleteCategory = async (req, res) => {
    try {
      const id = req.query.id;
      console.log(id);
      const categoryData = await category.findOne({ _id: id });
      if (categoryData.is_available) {
        await category.findByIdAndUpdate({ _id: id }, { $set: { is_available: 0 } }); console.log("hidden");
      }
      else { await category.findByIdAndUpdate({ _id: id }, { $set: { is_available: 1 } }); console.log("unhidden"); }
      res.redirect("/admin/category");
    } catch (error) {
      console.log(error);
    }
  };

  const editCategory = async (req, res) => {
    try {
      e_id = req.query.id;
      const catagoryDetail = await category.findOne({ _id: e_id })
      console.log(catagoryDetail);
      res.render("editCategories", { category: catagoryDetail, message: "" });
    } catch (error) {
      console.log(error.message);
    }
  };

  const editUpdateCategory = async (req, res) => {
    const find = await category.findOne({ categoryName: req.body.addCategory })
    if (find) {
      const cat = await category.find();
      res.render("editCategories", { message: "already Exists!!", category: cat })
    } else {
  
      try {
        const categotyData = await category.updateOne({ _id: e_id }, { $set: { categoryName: req.body.addCategory } });
        res.redirect("/admin/categories");
      } catch (error) {
        console.log(error.message);
      }
    }
  };

  
const loadOrder = async (req, res) => {
    try {
  
      const allorders = await orders.find()
      console.log(allorders);
      res.render("orders", {orders: allorders });
    } catch (error) {
      console.log(error.message);
    }
  };

  const viewOrderDetails = async (req, res) => {
    try {
      const id = req.query.id;
      const order = await orders.findById({ _id: id });
      const details = await order.populate('products.item.productId')
      res.render("viewOrderDetails", { orders: details });
    } catch (error) {
      console.log(error.message);
    }
  }

  const sortOrder = async (req, res) => {
    let { start, end } = req.body
    console.log(start, end);
    const allOrders = await orders.find({
      createdAt: { $gte: start, $lte: end }
    }).populate("userId");
    res.send({ orderDetail: allOrders });
  }

  const updateStatus = async (req, res) => {
    try {
      const status = req.body.status;
      const orderId = req.body.orderId;
      const orderDetails = await orders.findByIdAndUpdate({ _id: orderId }, { $set: { status: status } })
      if ((status == "cancelled") && orderDetails.payment.method !== "COD") {
        userDetails = await User.findOne({ _id: orderDetails.userId });
        const walletData = userDetails.wallet;
        userData = await User.updateOne({ _id: orderDetails.userId }, { $set: { wallet: walletData + orderDetails.payment.amount } })
      }
      if (status == "cancelled") {
        const productData = await Product.find()
        const orderData = await orders.findById({ _id: orderId });
        for (let key of orderData.products.item) {
          for (let prod of productData) {
            console.log(key.productId);
            if (new String(prod._id).trim() == new String(key.productId).trim()) {
              prod.stock = prod.stock + key.qty
              await prod.save()
            }
          }
        }
      }
      res.redirect("/admin/order")
    } catch (error) {
  
    }
  }
  
 


module.exports = {
    loadAdminLogin,
    verifyLogin,
    loadDashboard,
    adminLogout,
    loadUser,
    BlockUser,
    unblockUser,
    loadProducts,
    loadAddProducts,
    insertProduct,
    loadEditProduct,
    updateProduct,
    deleteProduct,
    recoverProduct,
    loadCategory,
    loadAddCategory,
    deleteCategory,
    editCategory,
    editUpdateCategory,
    insertCategory,
    loadOrder,
    viewOrderDetails,
    sortOrder,
    updateStatus
}