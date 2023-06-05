const {
  createUserService,
  loginService,
  logoutService,
  getCurrentUserService,
  changeTypeSubscriptionService,
  updateUserAvatarService,
} = require("../services/usersServices");
const { ctrlWrapper } = require("../utils/decorators");
const bcrypt = require("bcrypt");
const { HttpError } = require("../utils/errors");
const gravatar = require("gravatar");

const createUser = ctrlWrapper(async (req, res) => {
  const { password, email } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const user = await createUserService({ password: hash, email, avatarURL });

  res.status(201).json({
    user: {
      email,
      subscription: user.subscription,
    },
  });
});

const login = ctrlWrapper(async (req, res) => {
  const { token, email, subscription } = await loginService(req.body);

  res.json({
    token,
    user: {
      email,
      subscription,
    },
  });
});

const logout = ctrlWrapper(async (req, res) => {
  const user = await logoutService(req.user);

  if (!user) {
    throw new HttpError(401);
  }

  res.status(204).send();
});

const getCurrentUser = ctrlWrapper(async (req, res) => {
  const { email, subscription } = await getCurrentUserService(req.user);

  res.json({ email, subscription });
});

const changeTypeSubscription = ctrlWrapper(async (req, res) => {
  const { email, subscription } = await changeTypeSubscriptionService(req);

  res.json({ email, subscription });
});

const updateUserAvatar = ctrlWrapper(async (req, res) => {
  const { avatarURL } = await updateUserAvatarService(req);

  res.json({ avatarURL });
});

module.exports = {
  createUser,
  login,
  logout,
  getCurrentUser,
  changeTypeSubscription,
  updateUserAvatar,
};
