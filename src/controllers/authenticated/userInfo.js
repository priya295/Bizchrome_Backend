import UserModel from "../../models/user.js";

class userInfoController {
  static getLoggedInUser = async (req, res) => {
    const userInfo = await UserModel.findById(
      req.userId,
      "name email roleType location verification"
    );
    return res.status(200).send(userInfo);
  };
}
export default userInfoController;
