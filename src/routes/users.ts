import * as express from "express";

import {
    getUsers,
    getHash,
    updateToken,
    validateUser,
    saveUser,
    getUserFromRequest,
    serializeUser,
    updateUser
} from "../db-mock/users";
import { authenticate, AuthenticatedRequest } from "../middleware/auth";

const usersRouter = express.Router();

usersRouter.get("/", async (_, res) => {
    res.status(200).json((await getUsers()).map(serializeUser));
});

usersRouter.post('/login', async (req, res) => {
    const creds = {
        email: req.body.email,
        password: req.body.password
    };

    const user = (await getUsers())
        .find(u => u.email === creds.email
            && u.passwordHash === getHash(creds.password));
    if (user) {
        await updateToken(user.id);
        res.status(201).json(serializeUser(user));
    } else {
        const err: ApiError<User> = { message: "Wrong user credentials" };
        res.status(401).json(err);
    }
});

usersRouter.post('/', async (req, res) => {
    const validationResult = await validateUser(getUserFromRequest(req));
    if (validationResult.isValid) {
        const savedUser = await saveUser(validationResult.data);
        await updateToken(savedUser.id);
        res.status(201).json(serializeUser(savedUser));
    } else if (validationResult.isValid === false) {
        const errorResp: ApiError<User> = {
            message: "",
            fieldErrors: validationResult.errors
        };
        res.status(422).json(errorResp)
    }
});

usersRouter.put("/profile", authenticate, async (req: AuthenticatedRequest, res) => {
    const validationResult = await validateUser(getUserFromRequest(req));
    if (validationResult.isValid) {
        const updatedUser = await updateUser({
            id: req.user.id,
            ...validationResult.data
        });
        res.status(201).json(serializeUser(updatedUser));
    } else if (validationResult.isValid === false) {
        const errorResp: ApiError<User> = {
            message: "",
            fieldErrors: validationResult.errors
        };
        res.status(422).json(errorResp)
    }
});

export default usersRouter;