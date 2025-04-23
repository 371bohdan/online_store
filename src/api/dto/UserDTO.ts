import { IUser } from "../models/users"

export interface UserDTO {
    email: string
    password?: string,
    firstName?: string,
    lastName?: string,
    phoneNumber?: string
}

export const convertToUserDTO = (user: IUser): UserDTO => ({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber
})