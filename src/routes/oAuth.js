import express from "express";
const router = express.Router()
import { authConsent } from "../shared/googleAuth.js";

router.post('/', async function (req,res){
        await authConsent(req, res);
})

export default router;