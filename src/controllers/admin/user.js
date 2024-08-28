import mongoose from "mongoose";
import serviceModel from "../../models/service.js";
import UserModel from "../../models/user.js";

class userAdmin {
    static getAllUsers = async (req, res) => {
        try {
            const { page = 1, limit = 10 } = req.query;
            const users = await UserModel.find()
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .exec();

            const totalUsers = await UserModel.countDocuments();
            res.status(200).json({
                totalUsers,
                totalPages: Math.ceil(totalUsers / limit),
                currentPage: page,
                users,
            });
        } catch (error) {
            res.status(500).json({ error: "Error fetching users" });
        }
    };

    static deleteUser = async (req, res) => {
        try {
            const { userId } = req.params;
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ error: "Invalid User ID" });
            }
            const deletedUser = await UserModel.findOneAndDelete({ _id: userId });
            if (!deletedUser) {
                return res.status(404).json({ error: "User not found" });
            }

            res.status(200).json({ message: "User deleted successfully" });
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Error deleting user" });
        }
    };


    static updateUser = async (req, res) => {
        try {
            const { userId } = req.params;
            const updates = req.body;

            const updatedUser = await UserModel.findByIdAndUpdate(userId, updates, {
                new: true,
                runValidators: true,
            }).exec();

            // Log the updated user
            if (!updatedUser) {
                return res.status(404).json({ error: "User not found" });
            }

            res.status(200).json(updatedUser);

        } catch (error) {
            res.status(500).json({ error: "Error updating user" });
        }
    };





}
export default userAdmin;
