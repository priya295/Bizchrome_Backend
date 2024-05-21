import express from "express";
import userAuthController from "../controllers/userAuth.js";
const router = express.Router();
import { check } from "express-validator";
import { validatorError } from "../middlewares/validatorError.js";

router.post(
  "/register",
  [
    check("name").notEmpty().withMessage("name is required"),
    check("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email must be valid"),
    check("password")
      .notEmpty()
      .withMessage("password is required")
      .isLength({ min: 6 })
      .withMessage("password must have minimum 6 letters")
      .isLength({ max: 18 })
      .withMessage("password must not more than 18 letters")
      .isStrongPassword()
      .withMessage(
        "password must include mix of uppercase and lowercase with special characters and numbers"
      ),
    check("confirm_password")
      .notEmpty()
      .withMessage("confirm password is required")
      .custom((value, { req }) => {
        return value === req.body.password;
      })
      .withMessage("confirm password must match password"),
  ],
  validatorError,
  userAuthController.register
);

//login manually
router.post(
  "/login",
  [
    check("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email must be valid"),
    check("password").notEmpty().withMessage("password is required"),
  ],
  validatorError,
  userAuthController.login
);


router.get("/google", userAuthController.googleAuth);


router.post("/logout", userAuthController.logOut);

router.post("/send-verification-email/:email",userAuthController.sendVerificationEmail)
router.post("/verify-email/:email",userAuthController.verifyEmail)

router.post(
  "/forgot-password-email",
  [
    check("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email must be valid"),
  ],
  validatorError,
  userAuthController.sendForgotPasswordEmail
);

router.post(
  "/login/reset-password/:userId/:token",
  [
    check("password")
      .notEmpty()
      .withMessage("password is required")
      .isLength({ min: 6 })
      .withMessage("password must have minimum 6 letters")
      .isLength({ max: 18 })
      .withMessage("password must not more than 18 letters")
      .isStrongPassword()
      .withMessage(
        "password must include mix of uppercase and lowercase with special characters and numbers"
      ),
    check("confirm_password")
      .notEmpty()
      .withMessage("confirm password is required")
      .custom((value, { req }) => {
        return value === req.body.password;
      })
      .withMessage("confirm password must match password"),
  ],
  validatorError,
  userAuthController.resetPassword
);

router.post('/subscribe',userAuthController.subscribeNLetter)

export default router;
