import express from 'express';
import ServiceController from '../../controllers/user/service.js'; // Corrected the import

const router = express.Router();

router.post('/service', ServiceController.upsertService);

router.get('/service', ServiceController.getAllServices);

router.get('/service/:id', ServiceController.getService);
router.get('/services/category/:category_id', ServiceController.getServicesByCategory);

router.get('/services/user/:userInfo', ServiceController.getServicesByUserId);

router.get('/services/subcategory/:subCategories', ServiceController.getServicesBySubCategory);

router.patch('/service/edit/:id', ServiceController.updateService);

router.delete('/service/:id', ServiceController.deleteService);

export default router;
