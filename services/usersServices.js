const User = require("../models/user");
const { HttpError } = require("../utils/errors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = process.env;
const path = require("path");
const fs = require("fs/promises");
const { resizeImage } = require("../utils/jimp/resizeImage");

const createUserService = async (data) => {
  const { email } = data;
  const user = await User.findOne({ email });

  if (user !== null) {
    throw new HttpError(409, "Email in use");
  }

  return await User.create(data);
};

const verifyTokenService = async (verificationToken) => {
  const user = await User.findOne({ verificationToken });

  if (user === null) {
    throw new HttpError(404);
  }

  await User.findByIdAndUpdate(user._id, {
    verificationToken: null,
    verified: true,
  });
};

const resendEmailService = async (email) => {
  const user = await User.findOne({ email });

  if (user === null) {
    throw new HttpError(400);
  }

  if (user.verified || !user.verificationToken) {
    throw new HttpError(400, "Verification has already been passed");
  }

  return user;
};

const loginService = async ({ email, password }) => {
  const user = await User.findOne({ email });
  const { verificationToken, verified } = user;

  if (user === null) {
    throw new HttpError(401, "Email or password is wrong");
  }

  if (verificationToken || !verified) {
    throw new HttpError(401, "Not verified");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new HttpError(401, "Email or password is wrong");
  }

  const payload = {
    id: user._id,
    email: user.email,
  };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "24h" });
  return await User.findOneAndUpdate({ email }, { token }, { new: true });
};

const logoutService = async ({ _id }) => {
  const user = await User.findByIdAndUpdate(_id, { token: null });

  if (!user) {
    throw new HttpError(401);
  }

  return user;
};

const getCurrentUserService = async ({ _id }) => {
  return await User.findById(_id);
};

const changeTypeSubscriptionService = async (data) => {
  const { _id: id } = data.user;
  const { subscription } = data.query;

  return await User.findByIdAndUpdate(id, { subscription }, { new: true });
};

const storeAvatars = path.join(__dirname, "../", "public", "avatars");

const updateUserAvatarService = async (data) => {
  const { _id: id } = data.user;
  const { path: temporaryPath, originalname } = data.file;
  const fileName = `${id}_${originalname}`;
  const avatarURL = path.join("avatars", fileName);
  const constantPath = path.join(storeAvatars, fileName);

  await resizeImage(temporaryPath, 250, 250);
  await fs.rename(temporaryPath, constantPath);
  return await User.findByIdAndUpdate(id, { avatarURL }, { new: true });
};

module.exports = {
  createUserService,
  verifyTokenService,
  resendEmailService,
  loginService,
  logoutService,
  getCurrentUserService,
  changeTypeSubscriptionService,
  updateUserAvatarService,
};
