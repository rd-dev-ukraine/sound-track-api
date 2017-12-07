import * as crypto from "crypto";
import { Request } from "express";
import { AuthenticatedRequest } from "../middleware/auth";

const users: User[] = [
    {
        id: 1,
        firstName: "Igor",
        lastName: "Turko",
        city: "Kharkiv",
        userName: "igorturko",
        email: "igor@gmail.com",
        passwordHash: getHash("password")
    }
];

export function getHash(data: string): string {
    return crypto.createHash("sha256").update(data).digest("hex");
}

export const getUsers = (): Promise<User[]> => {
    return new Promise((resolve) => {
        resolve(users);
    });
}

export const updateToken = (id: number): Promise<any> => {
    return new Promise((resolve) => {
        const user = users.find(u => u.id === id);
        user.token = getHash(Date().toString());
        resolve(true);
    })
}

export const getUserFromRequest = (req: Request | AuthenticatedRequest): User => {
    const body: UserForm = { ...req.body };

    let passwordHash;
    if (body.password) {
        passwordHash = getHash(body.password);
        delete body.password;
        delete body.passwordConfirmation;
    }

    const fromRequest: User = {
        id: body.id ? +body.id : body.id,
        firstName: body.firstName,
        lastName: body.lastName,
        userName: body.userName,
        city: body.city,
        email: body.email,
        passwordHash
    };

    for (const field in fromRequest) {
        if (!(fromRequest[field] || fromRequest[field] === 0)) {
            delete fromRequest[field]
        }
    };

    return {
        ...(req["user"] || {}),
        ...fromRequest
    };
}

export const serializeUser = (user: User): User => {
    const toSend = { ...user };
    delete toSend.passwordHash;
    return toSend;
}

// For simplicity there are no required validations
export const validateUser = (user: User): Promise<ValidationResult<User>> => {
    return new Promise((resolve) => {
        const errors: ModelErrors<User> = {} as any;

        const emailTaken = !!users.find(u => u.email.toLowerCase() === user.email.trim().toLowerCase() && u.id !== user.id);
        if (emailTaken) {
            errors.email = "This email address is already in use"
        }

        const userNameTaken = !!users.find(u => u.userName.toLowerCase() === user.userName.trim().toLowerCase() && u.id !== user.id);
        if (userNameTaken) {
            errors.userName = "This screen name is already in use"
        }

        const isValid = !Object.keys(errors).length;
        if (isValid) {
            resolve({
                isValid: true,
                data: user
            })
        } else {
            resolve({
                isValid: false,
                errors
            })
        }
    })
}

export const saveUser = (user: User): Promise<User> => {
    return new Promise((resolve) => {
        const toSave: User = {
            ...user,
            id: getNextUserId()
        };
        users.push(toSave);
        resolve(toSave);
    })
}

export const updateUser = (user: User): Promise<User> => {
    return new Promise((resolve) => {
        const index = users.findIndex(u => u.id === user.id);
        const toSave: User = {
            ...users[index],
            ...user,
        };
        users[index] = toSave;
        resolve(toSave);
    });
}

export const getNextUserId = (): number => {
    return users.length + 1;
}

