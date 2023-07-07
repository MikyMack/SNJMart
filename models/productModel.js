const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({

    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    images:[{
        type:String ,
        required:true
    }],
    quantity:{
        type:Number,
        required:true
    },
    is_in_cart:{
        type:Number,
        required:true
    },
    is_available:{
        type:Number,
        required:true
    }

})

module.exports = mongoose.model("product",productSchema)