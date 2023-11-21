import { Router } from "express";
import { check, validationResult } from "express-validator";
import {
  createPlace,
  deletePlace,
  getPlaceById,
  getPlaceByUserId,
  updatePlace
} from "../controller/places-controller.js";
import { upload } from "../util/multer-cloudinary.js";
import { checkAuth } from "../middleware/auth-check.js";
export const placeRoute = Router();



placeRoute.get("/:pid", getPlaceById);

placeRoute.get("/user/:uid", getPlaceByUserId);

placeRoute.use(checkAuth)

placeRoute.post(
  "/",
  upload.single("image"),
  createPlace
);

placeRoute.patch("/:pid",[check('title').notEmpty(), check('description').notEmpty() ],updatePlace);

placeRoute.delete("/:pid", deletePlace);