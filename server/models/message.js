const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    chatId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"chats",
        require:true
    },
    sender:{
       type:mongoose.Schema.Types.ObjectId,
       ref:"user",
        require:true
    },
    text:{
        type:String,
        require:true
    },
    read:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

module.exports = mongoose.model('messages',messageSchema);