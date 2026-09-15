const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
         type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
         type:String,
        required:true,
        // select:false,
        minlength:4
    },
    profilePic:{
          type:String,
    }
},{timestamps:true})

module.exports= mongoose.model('user',userSchema);
