import { validationResult } from "express-validator";
import { HttpError } from "../model/http-error.js";
import { getlocation } from "../util/getLocation.js";
import { Place } from "../model/place-model.js";
import { User } from "../model/user-model.js";
import mongoose, { startSession } from "mongoose";
import { cloudinary,upload } from "../util/multer-cloudinary.js";

export const getPlaceById = async (req, res, next) => {
  const pid = req.params.pid;
  let place;
  try {
    place = await Place.findById(pid);
  } catch (err) {
    return next(
      new HttpError(
        "Something went wrong, please try after some time",
        err.code
      )
    );
  }
  if (!place) {
    throw next(new HttpError("no place found", 402));
  }
  res.json({ place: place.toObject({ getters: true }) });
};

export const getPlaceByUserId = async (req, res, next) => {
  const uid = req.params.uid;
  let filteredPlaces;
  try {
    filteredPlaces = await Place.find({ creatorId: uid });
  } catch (err) {
    return next(new HttpError("No user found with this credentials", 422));
  }
  if (!filteredPlaces || filteredPlaces.length === 0) {
    return next(new HttpError("No places for the given userid", 402));
  }
  res
    .status(200)
    .json(filteredPlaces.map((place) => place.toObject({ getters: true })));
};

export const createPlace = async (req, res, next) => {
  let result
  try{
  const { errors } = validationResult(req);
  if (errors.length !== 0) {
    throw (new HttpError("invalid input passed", 422));
  }
  if (!req.file || !req.file.path) {
     throw (new HttpError("Please Select an Image", 408));
  }
   result = await cloudinary.uploader.upload(req.file.path);
  const { title, description, address, creatorId } = req.body;
  let coordinates;
  try {
    coordinates = await getlocation(address);
  } catch (err) {
    console.log(err.message);
     throw new HttpError(err.message,405);
  }
  let user;
  try {
    user = await User.findById(creatorId);
  } catch (err) {
     throw (new HttpError(err.message, 422));
  }
  if (!user) {
     throw (new HttpError("No user found with given creatorId", 422));
  }
  const newPlace = new Place({
    title,
    description,
    address,
    location: {
      lat: coordinates.lat,
      lan: coordinates.lng,
    },
    url: result.secure_url,
    creatorId,
  });
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await newPlace.save({ session: session });
    user.places.push(newPlace);
    await user.save({ session: session });
    await session.commitTransaction();
  } catch (err) {
    await cloudinary.uploader.destroy(result.public_id);
    throw (new HttpError("creating place failed", 500));
  }
  res.status(200).json({ place: newPlace });
}catch(err)
{
  if (result && result.public_id) {
    await cloudinary.uploader.destroy(result.secure_url);
  }
  return next(new HttpError(err.message,err.code||500));
}
};

export const updatePlace = async (req, res, next) => {
  const { errors } = validationResult(req);
  if (errors.length != 0) {
    return res.json({ errors });
  }
  const { title, description,creatorId } = req.body;
  const pid = req.params.pid;
  let updatedPlace;
  try {
    updatedPlace = await Place.findById(pid);
  } catch (err) {
    return next(new HttpError(err.message, 422));
  }
  if(!updatedPlace)
  {
    return next(new HttpError("No place found",404))
  }
  if(updatedPlace.creatorId.toString()!=creatorId){
    return next(new HttpError('You are not allowed to edit',401))
  }

  updatedPlace.title = title;
  updatedPlace.description = description;

  try {
    await updatedPlace.save();
  } catch (err) {
    return next(
      new HttpError("Something went wrong plese try after some time", 422)
    );
  }
  res
    .status(200)
    .json({ updatedPlace: updatedPlace.toObject({ getters: true }) });
};

export const deletePlace = async (req, res, next) => {
  const pid = req.params.pid;
  const { creatorId } = req.body;
  let place;
  try {
    const sess = await startSession();
    sess.startTransaction();
    place = await Place.findByIdAndDelete(pid, { session: sess }).populate(
      "creatorId"
    );
    if (!place) {
      return next(new HttpError("Couldn't find the place with given id", 400));
    }
    if(place.creatorId.id!=creatorId)
    {
      return next(new HttpError("You are not allowed to delete the place",401))
    }
    place.creatorId.places.pull(place);
    await place.creatorId.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError(err.message, 422));
  }
  res.status(200).json(place);
};
