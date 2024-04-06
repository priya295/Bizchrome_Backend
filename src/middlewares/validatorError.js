import { validationResult } from 'express-validator';

export function validatorError(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ message: errors.array() })
    }
    console.log("validation passed");
    next();
}
