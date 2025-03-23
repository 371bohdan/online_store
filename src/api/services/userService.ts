import NotFoundError from "../errors/general/NotFoundError";
import { UserRoles } from "../models/enums/userRolesEnum";
import User, { IUser } from "../models/users";
import BadRequestError from "../errors/general/BadRequestError";
import { ensureItemExists } from "./genericCrudService";

export const userService = {

    changeRole: async (userId: string, role: UserRoles): Promise<IUser> => {
        await ensureItemExists(User, '_id', userId);
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

    getAllRoles: (): Array<UserRoles> => {
        return Object.values(UserRoles);
    }
}