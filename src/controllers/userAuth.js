// import  from "../model/user"
import UserModel from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { authClient, getUserData } from "../shared/googleAuth.js";
import transporter from "../config/email.js";
import newsLetterModel from "../models/newsLetter.js";

class userAuthController {
  static register = async (req, res) => {
    console.log("register request initiated", req.body);
    const { email, password } = req.body;
    // const manualAndGoogleRegisteredUser = await UserModel.findOne({
    //   email,
    //   google_auth: true,
    //   manual_register: true,
    // });
    // const manualRegisteredUser = await UserModel.findOne({
    //   email,
    //   manual_register: true,
    // });

    // if (manualAndGoogleRegisteredUser || manualRegisteredUser) {
    //   return res.status(400).json({ message: "User already exist" });
    // }
    const isUserExist = await UserModel.findOne({ email });
    if (isUserExist) {
      return res.status(400).json({ message: "User already exist" });
    }
    const salt = await bcrypt.genSalt(12);
    const hashPassword = await bcrypt.hash(password, salt);

    req.body.password = hashPassword;
    req.body.manual_register = true;

    const user = await UserModel.create(req.body);

    if (user) {
      const token = await jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "1d",
        }
      );
      res.cookie("token", token, {
        // httpOnly: true,
        // sameSite: 'none',
        secure: process.env.NODE_ENV === "production",
        maxAge: 86400000,
      });
      console.log("register request completed");
      return res.status(200).send({ message: "User registered successfully" });
    } else {
      return res.status(400).json({ message: "Error registering user" });
    }
  };

  static login = async (req, res) => {
    console.log("Login request initiated");

    const { email, password } = req.body;

    try {
      // Find user by email
      const user = await UserModel.findOne({ email });
      if (!user || !user.password) {
          return res.status(400).json({ message: "Invalid Credentials" });
      }

      console.log("User found:", user);

      // Check password match
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(400).json({ message: "Invalid Credentials" });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
          expiresIn: "1d", // Token expiration time
      });

      console.log("Login successful. Token generated:", { token, userId: user._id });

      // Send the userId and token in the response
      res.status(200).json({ userId: user._id, token, message: "Login successful" });
      console.log(user._id);
  } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
};



  static Adminlogin = async (req, res) => {
    console.log("login request initiated");
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    if (!user.isAdmin) {
      return res.status(400).json({ message: "Your are not a admin" });
    }

    if (!user || !user?.password) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign({ userId: user.id, Admin: "true" }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });
    console.log(token)
    res.cookie("token", token, {
      // httpOnly: true,
      // sameSite: 'none',
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400000,
    });
    console.log("login request completed");

    res.status(200).json({ userId: user._id, token, message: "Login successfull" });
  };

  // this route handler is not hit directly from frontend - this is redirect url from googleAuth
  static googleAuth = async (req, res) => {
    console.log("google auth request initiated");
    const code = req.query.code;
    if (!code) {
      return res
        .status(400)
        .json({ error: "user declined google authentication" });
    }

    const client = await authClient();
    const r = await client.getToken(code);
    // Make sure to set the credentials on the OAuth2 client.
    await client.setCredentials(r.tokens);
    console.info("Tokens acquired.");
    // const user = oAuth2Client.credentials;
    // console.log('credentials',user);
    const userData = await getUserData(client.credentials.access_token);

    //store user info in db
    const user = await UserModel.findOneAndUpdate(
      { email: userData?.email },
      {
        $setOnInsert: {
          name: userData?.name,
          google_sub: userData?.sub,
          email: userData.email,
          google_auth: true,
        },
      },
      {
        upsert: true,
        new: true, // Return the modified document rather than the original
      }
    );

    //generate jwt
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      // httpOnly: true,
      // sameSite: 'none',
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400000,
    });

    console.log("google auth request completed");
    const redirectUrl = `${process.env.FRONTEND_URL}`;
    return res.redirect(redirectUrl);
    // return res
    //   .status(200)
    //   .json({ message: "google authentication successfull" });
  };

  static sendVerificationEmail = async (req, res) => {
    const { email } = req.params;
    const user = await UserModel.findOne({ email }, "email verification");

    if (!user) {
      return res.status(422).json({ message: "Account is not registered" });
    }
    if (user.verification.isVerified) {
      return res.status(422).json({ message: "Account is already verified" });
    }
    //send email with otp
    // generate the admin code
    const code = Math.floor(100000 + Math.random() * 900000);

    // calculate the expiration date (e.g. 15 minutes from now)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "BizChrome email verification",
      text: "Hello world?", // plain text body
      html: `<span>Here is your one-time OTP: ${code}</span>
      <br>
      <span>Note: This OTP will expire in 15 minutes.</span>`, // html body
    });

    const userData = await UserModel.findOneAndUpdate(
      { email },
      { verification: { code, expiresAt, isVerified: false } }
    );
    return res.status(200).send({
      status: "success",
      message: "Verification code sent successfully",
      info: info,
    });
  };

  static verifyEmail = async (req, res) => {
    const { otp } = req.body;
    const { email } = req.params;
    const currentTime = new Date();

    const user = await UserModel.findOne({
      email,
      "verification.code": otp,
      "verification.expiresAt": { $gt: currentTime },
    });

    if (!user) {
      return res.status(422).json({ message: "Invalid code" });
    }
    const updated = await UserModel.updateOne(
      { email },
      { verification: { isVerified: true } }
    );
    if (updated.modifiedCount > 0) {
      return res.status(200).json({ message: "Account verified successfully" });
    }
    return res.status(422).json({ message: "Error verifying email" });
  };

  static logOut = async (req, res) => {
    console.log("logout request");

    //creating empty auth token and expires at the time of creation
    // res.cookie("token", "", {
    //   expires: new Date(0),
    // });
    res.clearCookie("token");
    console.log("logout request completed");

    res.status(200).json({ status: "success", message: "logout successfully" });
  };

  static sendForgotPasswordEmail = async (req, res) => {
    console.log("forgot password email request initiated");

    const { email } = req.body;
    const user = await UserModel.findOne({ email });
    if (user) {
      const secret = user._id + process.env.JWT_SECRET_KEY;
      const token = jwt.sign({ userId: user._id }, secret, {
        expiresIn: "15m",
      });

      const link = `${process.env.FRONTEND_URL}/auth/login/reset-password/${user._id}/${token}`;

      // send email
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM, // sender address
        to: user.email, // list of receivers
        subject: "BizChrome password reset link", // Subject line
        text: "Hello world?", // plain text body
        html: `<a href=${link}>Click Here</a> to Reset Your Password`, // html body
      });
      console.log("forgot password email request completed");

      return res.status(200).send({
        status: "success",
        message: "Password Reset Email Sent. Please Check Your Email",
        info: info,
      });
    } else {
      return res.status(400).send({ message: "Invalid email" });
    }
  };

  static resetPassword = async (req, res) => {
    console.log("reset password api");

    const { userId, token } = req.params;
    const { password } = req.body;

    // Verify the token
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const secret = user._id + process.env.JWT_SECRET_KEY;

    jwt.verify(token, secret, async (err) => {
      if (err) {
        return res
          .status(401)
          .json({ status: "failed", message: "Invalid or expired token" });
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(12);
      const hashPassword = await bcrypt.hash(password, salt);

      //if password exist i.e manual register else google auth
      const updatedUser = await UserModel.findByIdAndUpdate(
        { _id: userId },
        { password: hashPassword },
        { new: true }
      );

      console.log("reset password request completed");

      res.json({
        status: "success",
        message:
          "Password reset successful. You can now log in with your new password.",
      });
    });
  };

  static subscribeNLetter = async (req, res) => {
    const { email } = req.body
    const existingUser = await newsLetterModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Already Subscribed" });
    }

    await newsLetterModel.findOneAndUpdate(
      { email },
      { email },
      { upsert: true, new: true }
    );

    // Send a success response
    res.status(201).json({ message: "Subscribed successfully" });
  };
}

export default userAuthController;