const User = require('../models/userModel')
const products = require("../models/productModel")



const loadCart = async (req, res) => {
    try {
        userSession = req.session.user_id;
        if (userSession) {  
            
            const userData = await User.findById({ _id: userSession })
            const completeUser = await userData.populate('cart.item.productId')
            // if (req.query.coupon) {
            //     coup = req.query.coupon
            // } else {
            //     coup = 0;
            // }
            res.render("cart", { user: req.session.user, cartProducts: completeUser.cart});

        } else {
            res.redirect("/login");
        }
    } catch (error) {
        console.log(error.message);
    }
}
const addToCart=async(req,res)=>{
    try{
        const productId=req.query.id;
        console.log(productId);
        userSession=req.session.user_id;
        if(userSession){
            const details=await products.findOne({_id:productId})
            const product=await products.find({category:details.category});
            const userData=await User.findById({_id:userSession});
            const productData=await products.findById({_id:productId});
            userData.addToCart(productData)
            res.redirect('/loadCart');
        }else{
            res.redirect('/login')
        }
    }catch(error){
        console.log(error.message);
    }
}
const updateCart = async (req, res) => {
    try {
        console.log("thisss");
        let { quantity, _id } = req.body
        const userData = await User.findById({ _id: req.session.user_id })
        console.log(quantity);
        const productData = await products.findById({ _id: _id })
        const price = productData.price;
        let test = await userData.updateCart(_id, quantity)
        console.log(test);
        res.json({ test, price })

    } catch (error) {
        console.log(error)
    }
}
const deleteCart = async (req, res,) => {

    try {
        const productId = req.query.id
        userSession = req.session
        const userData = await User.findById({ _id: userSession.user_id })
        userData.removefromCart(productId)
        res.redirect('/loadCart')
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    loadCart,
    addToCart,
    updateCart,
    deleteCart
}