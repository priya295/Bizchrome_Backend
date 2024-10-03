import serviceModel from "../../models/service.js";
import UserModel from "../../models/user.js";

class userInfoController {
  // Fetch logged-in user info
  static getLoggedInUser = async (req, res) => {
    try {
      const userInfo = await UserModel.findById(
        req.userId,
        "name email roleType location verification credits mobileNumber"
      );
      return res.status(200).send(userInfo);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching user data", error: error.message });
    }
  };

  // Edit profile function
  static editProfile = async (req, res) => {
    try {
      const userId = req.userId;
      const { name, email, location, roleType, image, mobileNumber } = req.body;

      // Initialize object to hold fields to update
      const updateFields = {};

      if (name) updateFields.name = name;
      if (email) updateFields.email = email;
      if (location) updateFields.location = location;
      if (roleType) updateFields.roleType = roleType;
      if (image) updateFields.image = image;

      // Validate the mobile number before updating
      if (mobileNumber) {
        const mobileRegex = /^[0-9]{10}$/;  // Validate for 10-digit number
        if (!mobileRegex.test(mobileNumber)) {
          return res.status(400).json({ message: "Invalid mobile number format. Must be a 10-digit number." });
        }
        updateFields.mobileNumber = mobileNumber;  // Update mobile number if valid
      }

      const updatedUser = await UserModel.findByIdAndUpdate(userId, updateFields, { new: true });

      // If roleType is "client", delete associated services
      if (roleType === "client") {
        await serviceModel.deleteOne({ userInfo: userId });
      }

      // Update location in the serviceModel if location is updated
      if (location) {
        await serviceModel.findOneAndUpdate(
          { userInfo: userId },  // Filter by userInfo
          { location }           // Update location
        );
      }

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ message: "User details updated successfully", updatedUser });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  };

  // Fetch all users' status
  static usersStatus = async (req, res) => {
    try {
      const userStatus = await UserModel.find({}, "status name").lean();

      const updateFields = userStatus.map((user) => ({
        ...user,
        userId: user._id,
      }));

      return res.status(200).send(updateFields);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  };
}

export default userInfoController;
