
export function errorHandler(err, req, res, next) {
    console.error(err.stack,"error");
    res.status(500).json({ message: "Internal server error" });
}
