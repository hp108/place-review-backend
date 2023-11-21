import multer from "multer";
import { v2 as cloudinary } from 'cloudinary'
import {CloudinaryStorage} from 'multer-storage-cloudinary'
import dotenv from 'dotenv'
dotenv.config()

const API_KEY = process.env.CLOUDINARY_API_KEY
const API_SECRET = process.env.CLOUDINARY_API_SECRET
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
const FOLDER_NAME = process.env.CLOUDINARY_FOLDER_NAME


cloudinary.config({ 
  cloud_name: CLOUD_NAME, 
  api_key: API_KEY, 
  api_secret: API_SECRET,
  secure: true
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
      return {
          folder: FOLDER_NAME,
          public_id: file.fieldname + '-' + Date.now()
      }
  }
})

const upload = multer({storage:storage})

export {upload,cloudinary}