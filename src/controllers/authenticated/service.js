import mongoose from "mongoose";
import serviceModel from "../../models/service.js";
import { query } from "express";

class serviceController {
  static addService = async (req, res) => {
    console.log("add service req initialized");
    const { userId } = req.params;
    req.body.userInfo = userId;
    const updateService = await serviceModel.findByIdAndUpdate(
      userId,
      req.body,
      { upsert: true }
    );
    console.log(updateService, "updateservicee");
    console.log("add service req completed");
    return res.status(200).json({
      status: "success",
      message: "your service created successFully",
    });
  };

  static updateService = async (req, res) => {
    const { userId } = req.params;
      try {
      console.log(req.body,'check')
      const updateService = await serviceModel.updateOne({ _id: userId }, { ...req.body }, { new: true });

     console.log(updateService,'check what is this')
      if (updateService.modifiedCount > 0) {
        console.log('Update service request completed');
        return res.status(200).json({
          status: 'success',
          message: 'Changes saved successfully',
        });
      } else {
        return res.status(404).json({
          status: 'failed',
          message: 'User not found or no changes made',
        });
      }
    } catch (error) {
      console.error('Error updating service:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Something went wrong. Please try again later.',
      });
    }
  };

  static deleteService = async (req, res) => {
    const { userId } = req.params;
    const updated = await serviceModel.deleteOne({ userId });
    if (updated.deletedCount > 0) {
      return res.status(200).json({
        status: "success",
        message: "service deleted successFully",
      });
    } else {
      return res.status(401).json({
        status: "failed",
        message: "something went wrong. Try again !",
      });
    }
  };

  static getService = async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Validate userId
      if (!userId) {
        return res.status(400).send({ message: "User ID is required." });
      }
  
      // Find service by userId
      const service = await serviceModel.findById(userId).populate("userInfo","-password");
  
      // Check if service exists
      if (!service) {
        return res.status(404).send({ message: "Service not found." });
      }
  
      // Return the service
      return res.status(200).send(service);
    } catch (error) {
      // Handle unexpected errors
      console.error("Error in getService:", error);
      return res.status(500).send({ message: "Internal server error." });
    }
  };
  

  static getAllServices = async (req, res) => {
    // const { location, domain, specifications } = req.query;
    const { location, domain, specification, page, perPage } = req.query;
    console.log(location, domain, specification, page, perPage)

    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(perPage) || 10;
    const skipCount = (pageNumber - 1) * pageSize;

      let query = {};
        if (location) {
            query["location"] = location;
        }
        if (domain) {
            query["areaOfExpertise.domain"] = domain;
        }
        if (specification) {
            query["areaOfExpertise.specifications"] = specification;
        }
        const totalServices = await serviceModel.countDocuments(query);

        const services = await serviceModel
            .find(query)
            .populate("userInfo", "name credits roleType image")
            .sort({ "userInfo.credits": -1 })
            .skip(skipCount)
            .limit(pageSize);

        const totalPages = Math.ceil(totalServices / pageSize);

        const paginationResponse = {
          currentPage: pageNumber,
          totalItemsInCurrentPage: services.length,
          totalItems: totalServices,
          totalPages: totalPages,
          services,
      };

      
      if (pageNumber < totalPages) {
        paginationResponse.nextPage = `/user/services?location=${location}&domin=${domain}&specifications=${specification}&page=${pageNumber + 1}&perPage=${pageSize}`;
    }

    if (pageNumber > 1) {
        paginationResponse.prevPage = `/user/services?location=${location}&domin=${domain}&specifications=${specification}&page=${pageNumber - 1}&perPage=${pageSize}`;
    }
    
    return res.status(200).send(paginationResponse);
  };
}
export default serviceController;
