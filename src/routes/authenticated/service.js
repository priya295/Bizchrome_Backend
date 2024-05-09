import express from "express";
import { validatorError } from "../../middlewares/validatorError.js";
import serviceController from "../../controllers/authenticated/service.js";
import { check } from "express-validator";
const router = express.Router();
const validateService = [
  check("profileImage").notEmpty().withMessage("Profile Image is required"),
  check("title").notEmpty().withMessage("Title is required"),
  check("bio").notEmpty().withMessage("Bio is required"),
  check("location").notEmpty().withMessage("Location is required"),
  check("education").isArray().withMessage("Education must be an array"),
  check("experience").isArray().withMessage("Experience must be an array"),
  check("connectionSources.portfolio")
    .isURL()
    .withMessage("Portfolio URL must be valid"),
  check("connectionSources.linkedIn")
    .isURL()
    .withMessage("LinkedIn URL must be valid"),
  check("connectionSources.email").isEmail().withMessage("Email must be valid"),
  check("connectionSources.contact")
    .isMobilePhone()
    .withMessage("Contact must be a valid phone number"),
  check("areaOfExpertise")
    .isArray()
    .withMessage("Area of Expertise must be an array"),
];

router.post(
  "/:userId",
  validateService,
  validatorError,
  serviceController.addService
);
router.put(
  "/:userId",
  // validateService,
  // validatorError,
  serviceController.updateService
);
router.delete("/:userId", serviceController.deleteService);
router.get("/:userId", serviceController.getService);
router.get("/", serviceController.getAllServices);
//all services as per category
//as per thier credit scores
// router.get('/services',)
// router.get('/all/:userId')
// router.get('/:serviceId')
// router.put('/:userId/:serviceId')
// router.delete('/:userId/:serviceId')

export default router;
