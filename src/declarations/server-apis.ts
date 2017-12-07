interface UserBase {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    userName: string;
    city: string;
}

interface User extends UserBase {
    passwordHash?: string;
    token?: string;
}

interface UserForm extends UserBase, PasswordForm { }

interface PasswordForm {
    password: string;
    passwordConfirmation: string;
}

interface UserForm extends UserBase, PasswordForm { }

interface OkResult<T> {
    ok: true;
    response: T;
}

interface ErrorResult<T> {
    ok: false;
    error: ApiError<T>;
}

type ApiResponse<T = {}, E = T> = OkResult<T> | ErrorResult<E>;


interface ApiError<T = {}> {
    message: string;
    fieldErrors?: ModelErrors<T>;
}

type ModelErrors<T> = {[field in keyof T]: string; }