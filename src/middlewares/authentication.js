
import jwt from "jsonwebtoken";
const verifyToken = (req, res, next) => {
    console.log("token verification initialized")
    const token = req.cookies["auth_token"];
   
    if (!token) {
        return res.status(401).json({ message: "unauthorised" })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        req.userId = (decoded).userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: "unauthorised" })
    }
}
export default verifyToken;