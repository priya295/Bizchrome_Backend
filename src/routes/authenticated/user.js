import express from 'express'
import userInfoController from '../../controllers/authenticated/userInfo.js';
const router = express.Router();

// router.get('/',userInfoController.getLoggedInUser)
router.put('/edit',userInfoController.editProfile)
export default router;