import mongoose from 'mongoose';
import ServiceModel from '../../models/service.js'; // Adjust the path as necessary

class ServiceController {
    // Create a new Service
    static createService = async (req, res) => {
        try {
            const newService = new ServiceModel(req.body);
            await newService.save();
            res.status(201).json(newService);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    // Update an existing Service
    static updateService = async (req, res) => {
        try {
            const { id } = req.params;
            const updates = req.body;

            const updatedService = await ServiceModel.findByIdAndUpdate(id, updates, {
                new: true,
                runValidators: true,
            }).exec();

            if (!updatedService) {
                return res.status(404).json({ error: 'Service not found' });
            }

            res.status(200).json(updatedService);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    // Delete a Service
    static deleteService = async (req, res) => {
        try {
            const { id } = req.params;
            const deletedService = await ServiceModel.findByIdAndDelete(id);

            if (!deletedService) {
                return res.status(404).json({ error: 'Service not found' });
            }

            res.status(200).json({ message: 'Service deleted successfully' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    // Get a single Service
    static getService = async (req, res) => {
        try {
            const { id } = req.params;
            const service = await ServiceModel.findById(id) // Use findById for querying by _id
            .populate('userInfo') // Populate category data
                .populate('category_id') // Populate category data
                .populate('subCategories') // Populate category data
                .exec();
                console.log("service");
                console.log(service);
            if (!service) {
                return res.status(404).json({ error: 'Service not found' });
            }
    
            res.status(200).json(service);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    // Get all Services with populated user, category, and subcategory data
    static getAllServices = async (req, res) => {
        try {
            const service = await ServiceModel.find()
            .populate('userInfo') // Populate category data
            .populate('category_id') // Populate category data
            .populate('subCategories') // Populate category data
            .exec();
            console.log("service");
            console.log(service);
            if (!service || service.length === 0) {
                return res.status(404).json({ error: 'No service found' });
            }

            res.status(200).json({ services });
        } catch (error) {
            res.status(500).json({ error: 'Error fetching services' });
        }
    };

    // Get services by category
    static getServicesByCategory = async (req, res) => {
        try {
            const { category_id } = req.params;
            // Query services by category_id
            const services = await ServiceModel.find({ category_id })
            .populate('userInfo') // Populate category data
            .populate('category_id') // Populate category data
            .populate('subCategories') // Populate category data
            .exec();
    
            console.log("services");
            console.log(services);
    
            if (!services.length) {
                return res.status(404).json({ message: "No services found for this category." });
            }
    
            res.status(200).json(services);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching services by category ID', message: error.message });
        }
    };


    static getServicesByUserId = async (req, res) => {
        try {
            const { userInfo } = req.params;    
            // Query services by userInfo
            const services = await ServiceModel.find({ userInfo })
            .populate('userInfo') // Populate category data
            .populate('category_id') // Populate category data
            .populate('subCategories') // Populate category data
            .exec();
    

            if (!services.length) {
                return res.status(404).json({ message: "No services found for this user." });
            }

            res.status(200).json(services);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching services by user ID', message: error.message });
        }
    };

 // Get services by subcategory
 static getServicesBySubCategory = async (req, res) => {
    try {
        const { subCategories } = req.params;

        // Query services by subCategories
        const services = await ServiceModel.find({ subCategories })
        .populate('userInfo') // Populate category data
        .populate('category_id') // Populate category data
        .populate('subCategories') // Populate category data
        .exec();

        console.log("services");
        console.log(services);

        if (!services.length) {
            return res.status(404).json({ message: "No services found for this category." });
        }

        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching services by category ID', message: error.message });
    }
};

    // Upsert Service
    static upsertService = async (req, res) => {
        try {
            const { userInfo } = req.body; // Assuming userInfo is part of the request body
            const serviceData = req.body;
            const options = { upsert: true, new: true, setDefaultsOnInsert: true };

            const upsertedService = await ServiceModel.findOneAndUpdate(
                { userInfo },
                serviceData,
                options
            );

            res.status(upsertedService ? 200 : 201).json(upsertedService);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
}

export default ServiceController;
