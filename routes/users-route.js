import { Router } from "express";
import { signup, login, getUsers } from "../controller/users-controller.js";
import { check } from "express-validator";
import { upload } from "../util/multer-cloudinary.js";

export const userRoute = Router();

userRoute.get("/", getUsers);

userRoute.post(
  "/signup",
  upload.single('avatar'),
  [
    check("name").trim().notEmpty(),
    check("password").trim().notEmpty(),
    check("email").trim().normalizeEmail().isEmail(),
  ],
  signup
);

userRoute.post("/login",[
    check("password").trim().notEmpty(),
    check("email").trim().normalizeEmail().isEmail(),
  ], login);
