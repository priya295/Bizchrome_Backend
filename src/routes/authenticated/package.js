import express from "express";
import packageController from "../../controllers/authenticated/package.js";
const router = express.Router();

router.get("/", packageController.getPackages);

export default router;
