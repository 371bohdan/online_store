import NotFoundError from "../errors/general/NotFoundError";
import { UserRoles } from "../models/enums/userRolesEnum";
import User, { IUser } from "../models/users";
import BadRequestError from "../errors/general/BadRequestError";

export const userService = {
    changeRole: async (userId: string, role: UserRoles): Promise<IUser> => {
        await ensureUserExists('_id', userId);
        const user = await User.findOne({ _id: userId }) as IUser;

        if (user.role === UserRoles.OWNER) {
            throw new BadRequestError('The user has a higher role than the one you are trying to set or remove');
        }

        if (role === UserRoles.OWNER) {
            throw new BadRequestError("You cannot set 'owner' role");
        }

        if (!Object.values(UserRoles).includes(role)) {
            throw new BadRequestError(`The '${role}' role doesn't exists`);
        }

        return await User.findOneAndUpdate({ _id: user }, { role }, { new: true }) as IUser;
    },
}

/**
 * Returns a user found by the given field and value. Throws NotFoundError exception if user with provided field and value doesn't exist (from 'ensureUserExists' method)
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