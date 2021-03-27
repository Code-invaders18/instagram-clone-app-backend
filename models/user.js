const mongoose=require('mongoose')
const {ObjectId}=mongoose.Schema.Types

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required : true,
    },
    email:{
        type: String,
        required: true,
    },
    password:{
        type:String,
        required:true,
    },
    followers:[{
        type:ObjectId,
        ref:"User"
    }],
    following:[{
        type:ObjectId,
        ref:"User"
    }],
    pic:{
        type:String,
        default:"https://res.cloudinary.com/vmcloud18/image/upload/v1610265756/pexels-nadi-lindsay-3078831_bkrb6e.jpg"
    },
    resetToken:String,
    expireToken:Date
});
module.exports=mongoose.model("User",userSchema)