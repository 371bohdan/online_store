import { UserRoles } from "../models/enums/userRolesEnum"
import { IUser } from "../models/users"

export interface UserDTO {
    email: string
    password?: string,
    firstName?: string,
    lastName?: string,
    phoneNumber?: string,
    role: UserRoles
}

export const convertToUserDTO = (user: IUser): UserDTO => ({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    role: user.role
})