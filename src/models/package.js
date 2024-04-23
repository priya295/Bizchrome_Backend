// Import Mongoose package
import mongoose from "mongoose";

// Define the schema for the package
const packageSchema = new mongoose.Schema({
  name: { type: String }, // Name of the package
  credits: { type: Number }, // Number of credits in the package
  amount: { type: Number }, // Amount of the package
});

// Create a model based on the schema
const PackageModel = mongoose.model("Package", packageSchema);

// Default packages to be inserted into the database
const defaultPackages = [
  { name: "Basic", credits: 10, amount: 100 },
  { name: "Standard", credits: 23, amount: 200 },
  { name: "Premium", credits: 35, amount: 300 },
];

// Function to insert default packages into the database
async function insertDefaultPackages() {
  try {
    // Insert default packages into the database
    const packages = await PackageModel.find({});
    if(packages.length === 0){
    await PackageModel.insertMany(defaultPackages);
    console.log("Default packages inserted successfully!");}
  } catch (error) {
    console.error("Error inserting default packages:", error);
  }
}

// Export the model
export default PackageModel;

// Call the function to insert default packages when this module is executed
insertDefaultPackages();
