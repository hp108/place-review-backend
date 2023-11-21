import { HttpError } from "../model/http-error.js";
import { validationResult } from "express-validator";
import { User } from "../model/user-model.js";
import bcrypt from 'bcryptjs'
import { cloudinary,upload } from "../util/multer-cloudinary.js";
import jwt from "jsonwebtoken";


const SECRET_KEY = process.env.SECRET_KEY

export const signup = async(req,res,next)=>{
    let result;
    try{
        const {errors} = validationResult(req)
        if(errors.length != 0 )
        {
            throw (new HttpError(JSON.stringify(errors),401))
        }
        result = await cloudinary.uploader.upload(req.file.path);
        const {email,password,name} = req.body;
        let user;
        try{
            user= await User.findOne({email:email})
        }
        catch(err)
        {
            throw (new HttpError(err.message,422));
        }
        if(user)
        {
            throw (new HttpError("user aldready exists, please provide other credentials",400))
        }
        else{
            try{
                let hashedPassword
                hashedPassword=await bcrypt.hash(password,12)
                
                if(!req.file || !req.file.path)
                {
                    throw(new HttpError("Please Select an Image",408))
                }
            user = await User({
                name,
                email,
                password:hashedPassword,
                image:result.secure_url,
                places:[]
            })
            }
            catch(err)
            {
                throw (new HttpError(err.message,422));
            }
        }
        try{    
            await user.save()
        }
        catch(err)
        {
            throw (new HttpError(err.message,422))
        }
        let token;
        try{
        token = jwt.sign({userId:user.id,email:user.email},SECRET_KEY)
        }
        catch(err)
        {
            throw new HttpError(err.message,403)
        }
        res.json({userId:user.id,email:user.email,token:token})
    }
    catch(err)
    {
      if (result && result.public_id) {
        const dd=await cloudinary.uploader.destroy(result.secure_url);
      }
      return next(new HttpError(err.message|| err || "an error occured",err.code||500));
    }
}

export const login = async(req,res,next)=>{

    const {errors} = validationResult(req)
    if(errors.length != 0)
    {
        return next(new HttpError(JSON.stringify(errors),401))
    }
    const {email,password} = req.body
    let user;
    try{
        user = await User.findOne({email:email})
    }
    catch(err)
    {
        return next(new HttpError(err.message,422))
    }
    if(!user)
    {
        return next(new HttpError("invalid credentials please provide valid credentials",400))
    }
    let isValidPassword;
    try{
        isValidPassword = await bcrypt.compare(password,user.password)
    }
    catch(err)
    {
        return next(new HttpError("Could Not Login ,please check your credentials",403))
    }
    let token;
    try{
        token = jwt.sign({userId:user.id,email:user.email},SECRET_KEY)
        }
        catch(err)
        {
            return next(new HttpError(err.message,403))
        }
    res.json({userId:user.id,email:user.email,token:token})
}

export const getUsers=async (req,res,next)=>{
    let users;
    try{
         users = await User.find({},"-password")
    }
    catch(err)
    {
        return next(new HttpError(err.message,422))
    }
    return res.json({users:users.map(user=> user.toObject({getters:true}))})
}