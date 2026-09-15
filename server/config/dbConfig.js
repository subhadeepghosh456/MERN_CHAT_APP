const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI);

const db = mongoose.connection;

db.on('connected',()=>{
    console.log("DB Connection successful")
})

db.on('err',()=>{
    console.log("DB Connection failed!")
})

module.exports = db;