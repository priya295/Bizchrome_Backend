import mongoose from "mongoose";
import UserModel from "../../models/user.js"; // Adjust the path as necessary

class Getuser {
    // Get all users with pagination
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

    // Get user by ID
    static getUserById = async (req, res) => {
        try {
            const { userId } = req.params;
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ error: "Invalid User ID" });
            }
            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ error: "Error fetching user" });
        }
    };

    // Delete user by ID
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
            console.log(error);
            res.status(500).json({ error: "Error deleting user" });
        }
    };

    // Update user by ID
    static updateUser = async (req, res) => {
        try {
            const { userId } = req.params;
            const updates = req.body;

            const updatedUser = await UserModel.findByIdAndUpdate(userId, updates, {
                new: true,
                runValidators: true,
            }).exec();

            if (!updatedUser) {
                return res.status(404).json({ error: "User not found" });
            }

            res.status(200).json(updatedUser);
        } catch (error) {
            res.status(500).json({ error: "Error updating user" });
        }
    };
}

export default Getuser;
