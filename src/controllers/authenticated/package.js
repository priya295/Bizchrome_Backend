import PackageModel from "../../models/package.js";

class packageController {
  static getPackages = async (req,res) => {
    const packages = await PackageModel.find();
    return res.send(packages)
  };
}
export default packageController;
