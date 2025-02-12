import NotFoundError from "../errors/general/NotFoundError";
import User, { IUser } from "../models/users";

/**
 * Returns a user found by the given field and value
 * @param field The field from the 'IUser' interface
 * @param value The value of the given field
 */
export async function getUserByField(field: keyof IUser, value: any): Promise<IUser> {
    await ensureUserExists(field, value);
    return await User.findOne({ [field]: value }) as IUser;
}

/**
 * Checks if user exists in database
 * @param field The field from the 'IUser' interface
 * @param value The value of the given field
 * @throws NotFoundError exception if user with provided field and value doesn't exist
 */
export async function ensureUserExists(field: keyof IUser, value: any) {
    if (!await User.exists({ [field]: value })) {
        throw new NotFoundError(User.modelName);
    }
}