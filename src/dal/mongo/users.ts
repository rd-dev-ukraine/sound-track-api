import { Request } from "express";
import { ObjectID } from "mongodb";

import { getDb } from "../../database/mongo";
import { AuthenticatedRequest } from "../../middleware/auth";
import { getHash } from "../../utils";

function replaceId(user: any): User {
    user.id = (user._id as ObjectID).toHexString();
    delete user._id;
    return user;
}

const users = () => {
    return getDb().collection("users")
};

export const getUsers = (): Promise<User[]> => {
    return users().find({}).toArray().then(users =>
        users.map(replaceId)
    );
}

export const updateToken = (id: string): Promise<any> => {
    return updateUser({
        id,
        token: getHash(Math.random().toString())
    } as User);
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
        id: body.id,
        firstName: body.firstName && body.firstName.trim(),
        lastName: body.lastName && body.lastName.trim(),
        userName: body.userName && body.userName.trim(),
        city: body.city && body.city.trim(),
        email: body.email && body.email.trim().toLowerCase(),
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
export const validateUser = async (user: User): Promise<ValidationResult<User>> => {
    const errors: ModelErrors<User> = {} as any;

    const emailTaken = await users().findOne({
        email: user.email,
        _id: { $not: { $eq: new ObjectID(user.id) } }
    }).then(user => !!user);
    if (emailTaken) {
        errors.email = "This email address is already in use"
    }

    const userNameTaken = await users().findOne({
        userName: new RegExp(`^${user.userName}$`, 'i'),
        _id: { $not: { $eq: new ObjectID(user.id) } }
    }).then(user => !!user);
    if (userNameTaken) {
        errors.userName = "This screen name is already in use"
    }

    const isValid = !Object.keys(errors).length;
    if (isValid) {
        return {
            isValid: true,
            data: user
        };
    } else {
        return {
            isValid: false,
            errors
        };
    }
}

export const saveUser = (user: User): Promise<User> => {
    const token = getHash(Math.random().toString());
    return users().insertOne({
        ...user,
        token
    }).then(insertRes => {
        return {
            ...user,
            token,
            id: insertRes.insertedId.toHexString()
        }
    });
}

export const updateUser = (user: User): Promise<User> => {
    return users().findOneAndUpdate(
        { _id: new ObjectID(user.id) },
        {
            $set: {
                ...user
            }
        },
        {
            returnOriginal: false
        }
    )
        .then(updateRes => updateRes.value)
        .then(replaceId)
}

export const findUserBy = (findBy: FindByQuery<User>): Promise<User | null> => {
    const query = {};
    for (const findBykey in findBy) {
        const key = findBykey === "id" ? "_id" : findBykey;
        switch (key) {
            case "_id":
                query[key] = new ObjectID(findBy[findBykey]);
                break;
            case "userName":
            case "email":
                query[key] = new RegExp(`^${findBy[findBykey]}$`, 'i');
                break;
            default:
                query[key] = findBy[findBykey];
        }
    }
    return users().findOne(query).then(found => found ? replaceId(found) : null);
}

export const authentocateUser = (creds: { email: string, password: string }) => {
    return findUserBy({
        email: creds.email,
        passwordHash: getHash(creds.password)
    });
}