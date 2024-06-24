const mongoose = require("mongoose");
const contactSchema = mongoose.Schema({
    namecon:{
        type:String,
        trim:true,
      },
    emailcon:{
        type:String,
        trim:true,
        unique:true,
        lowercase:true,
        match:[/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,"invalid email"]
    },
    messagecon:{
      type:String
    }
    
},{timestamps:true})

  
  module.exports = mongoose.model("conatct",contactSchema);