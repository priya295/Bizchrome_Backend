import UserModel from "../../models/user.js";

class userInfoController {
  static getLoggedInUser = async (req, res) => {
    const userInfo = await UserModel.findById(
      req.userId,
      "name email roleType location verification credits"
    );
    return res.status(200).send(userInfo);
  };

  static editProfile = async(req, res) =>{
    try {
      const userId = req.userId;
      console.log(req.body,"req bodyy");
      const { name, email, location, roleType,image } = req.body;

      const updateFields = {};
      if (name) updateFields.name = name;
      if (email) updateFields.email = email;
      if (location) updateFields.location = location;
      if (roleType) updateFields.roleType = roleType;
      if(image) updateFields.image = image;

      const updatedUser = await UserModel.findByIdAndUpdate(userId,updateFields, { new: true });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ message: "User details updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
}
export default userInfoController;
