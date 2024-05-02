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

    const updateService = await serviceModel.updateOne({ userId }, req.body);
    if (updateService.modifiedCount > 0) {
      console.log("updateservice req completed");
      return res.status(200).json({
        status: "success",
        message: "changes saved successFully",
      });
    } else {
      return res.status(401).json({
        status: "failed",
        message: "something went wrong. Try again !",
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
    const { userId } = req.params;
    const service = await serviceModel.findById(userId);
    return res.status(200).send(service);
  };

  static getAllServices = async (req, res) => {
    const { location, domain } = req.query;
    let query = {};
    if (location) {
      query["location"] = location;
    }
    if (domain) {
      query["areaOfExpertise.domain"] = domain;
    }

    const services = await serviceModel
      .find(query)
      .populate("userInfo", "name");
    return res.status(200).send(services);
  };
}
export default serviceController;
