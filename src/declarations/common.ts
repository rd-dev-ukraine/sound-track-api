interface ValidationResultOk<T> {
    isValid: true;
    data: T;
}

interface ValidationResultError<T> {
    isValid: false;
    errors: ModelErrors<T>;
}

type ValidationResult<T> = ValidationResultOk<T> | ValidationResultError<T>;

type FindByQuery<T> = {
    [key in keyof T]?: string | number
};