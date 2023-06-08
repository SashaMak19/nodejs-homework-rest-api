const {
  createUserService,
  verifyTokenService,
  resendEmailService,
  loginService,
  logoutService,
  getCurrentUserService,
  changeTypeSubscriptionService,
  updateUserAvatarService,
} = require("../services/usersServices");
const { ctrlWrapper } = require("../utils/decorators");
const bcrypt = require("bcrypt");
const gravatar = require("gravatar");
const { sendEmail } = require("../utils/emailService/sendEmail");
const { nanoid } = require("nanoid");
const { BASE_URL } = process.env;

const createUser = ctrlWrapper(async (req, res) => {
  const { password, email } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const verificationToken = nanoid();

  const user = await createUserService({
    password: hash,
    email,
    avatarURL,
    verificationToken,
  });

  const verificationMessage = {
    to: email,
    subject: "Verification for the Contacts app",
    text: "Let's verify you so you can start.",
    html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationToken}"><strong>Click to verify</strong></a>`,
  };

  await sendEmail(verificationMessage);

  res.status(201).json({
    user: {
      email,
      subscription: user.subscription,
    },
  });
});

const verifyToken = ctrlWrapper(async (req, res) => {
  const { verificationToken } = req.params;

  await verifyTokenService(verificationToken);

  res.json({
    message: "Verification successful",
  });
});

const resendEmail = ctrlWrapper(async (req, res) => {
  const { email } = req.body;
  const user = await resendEmailService(email);

  const verificationMessage = {
    to: email,
    subject: "Verification for the Contacts app",
    text: "Let's verify you so you can start.",
    html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${user.verificationToken}"><strong>Click to verify</strong></a>`,
  };
  await sendEmail(verificationMessage);

  res.json({ message: "Verification email sent" });
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
  await logoutService(req.user);

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
  verifyToken,
  resendEmail,
  login,
  logout,
  getCurrentUser,
  changeTypeSubscription,
  updateUserAvatar,
};
