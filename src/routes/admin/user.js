import express from 'express'
import userInfoController from '../../controllers/authenticated/userInfo.js';
import userAdmin from '../../controllers/admin/user.js';
const router = express.Router();

router.get('/user',userAdmin.getAllUsers)
router.patch('/user/edit/:userId',userAdmin.updateUser)
router.delete('/user/:userId',userAdmin.deleteUser)
export default router;