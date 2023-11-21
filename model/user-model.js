import mongoose, { Schema ,model} from "mongoose"
import uniqueValidator  from "mongoose-unique-validator"

const userSchema =  Schema({
    name:{type : String, required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    image:{type:String,required:true},
    places:[{type:mongoose.Types.ObjectId,required:true,ref: "User"}]
})
userSchema.plugin(uniqueValidator)

export const User = model("User",userSchema)

