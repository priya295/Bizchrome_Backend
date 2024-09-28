import express from 'express';
import UsersController from "../../controllers/user/user.js"

const router = express.Router();

// Get all users with pagination
router.get('/user', UsersController.getAllUsers);

// Get user by ID
router.get('/user/:userId', UsersController.getUserById);

// Update user by ID
router.patch('/user/edit/:userId', UsersController.updateUser);

// Delete user by ID
router.delete('/user/:userId', UsersController.deleteUser);

export default router;
