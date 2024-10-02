import serviceModel from "../../models/service.js";
import UserModel from "../../models/user.js";

class userInfoController {
  static getLoggedInUser = async (req, res) => {
    const userInfo = await UserModel.findById(
      req.userId,
      "name email roleType location verification credits MobileNumber"
    );
    return res.status(200).send(userInfo);
  };

  static editProfile = async (req, res) => {
    try {
      const userId = req.userId;
      const { name, email, location, roleType, image, mobileNumber } = req.body; // Add mobileNumber here

      const updateFields = {};
      if (name) updateFields.name = name;
      if (email) updateFields.email = email;
      if (location) updateFields.location = location;
      if (roleType) updateFields.roleType = roleType;
      if (image) updateFields.image = image;
      if (mobileNumber) updateFields.mobileNumber = mobileNumber; // Add mobileNumber to updateFields


      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        updateFields,
        { new: true }
      );
      console.log(roleType,"roletypee");
      if (roleType === "client") {
      await serviceModel.deleteOne({ userInfo: userId });
      }
      if(location){
       await serviceModel.findOneAndUpdate( { userInfo: userId }, // Filter by userInfo
        { location } );
      }

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ message: "User details updated successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  };

  static usersStatus=async(req,res)=>{
    const userStatus = await UserModel.find({}, 'status name').lean();

    const updateFields = userStatus.map((user) => ({
      ...user,
      userId: user._id,
    }));
    
    return res.status(200).send(updateFields);
  }
}
export default userInfoController;
