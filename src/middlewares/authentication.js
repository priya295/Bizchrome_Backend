import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
    console.log("Token verification initialized");

    // Retrieve token from the Authorization header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Split the "Bearer <token>" string

    if (!token) {
        console.log("No token found");
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        console.log("Trying to verify token...");
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.userId = decoded.userId; // Attach userId to request

        console.log("Token verified, userId:", req.userId);
        next();
    } catch (error) {
        console.error("Error verifying token:", error.message);
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};

export default verifyToken;
