import { RequestHandler, Request } from "express";
import { findUserBy } from "../dal/mongo/users";


export interface AuthenticatedRequest extends Request {
    user: User;
}

export const authenticate: RequestHandler = async (req, res, next) => {
    const token = req.headers["auth-token"];
    if (!token) {
        const error: ApiError = {
            message: "Auth-Token header required"
        };
        res.status(401).json(error);
        return;
    }
    const user = (await findUserBy({ token: <string>token }));
    if (user) {
        (req as AuthenticatedRequest).user = user;
        next();
    } else {
        const error: ApiError = {
            message: "Token is invalid"
        }
        res.status(401).json(error);
    }
}