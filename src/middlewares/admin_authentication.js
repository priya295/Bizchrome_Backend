
import jwt from "jsonwebtoken";

function getBearerToken(req) {
    const header = req.headers.authorization

    if (!header) return null

    const [type, token] = header.split(" ")

    if (type !== "Bearer") {
        return null
    }

    return token.trim()
}


const verifyAdmin = (req, res, next) => {
    console.log("token verification initialized")
    const Ctoken = req.cookies["auth_token"];
    let token = getBearerToken(req) || (req.headers.token)

    if (req.headers.token && req.headers.token !== "") {
        logger.debug(
            `Token is being passed in headers. Please use Authorization header instead.`,
        )
    }

    if (!token && !Ctoken) {
        return res.status(401).json({ message: "unauthorised" })
    }
    if (!token) {
        token = Ctoken
    }
    try {
        console.log("trying to verify");
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        req.userId = (decoded).userId;
        if (!(decoded).Admin) {
            return res.status(401).json({ message: "unauthorised", "type": "not a admin" })
        }
        next();
    } catch (error) {
        return res.status(401).json({ message: "unauthorised" })
    }
}
export default verifyAdmin;