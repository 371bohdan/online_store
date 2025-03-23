import mailController from "../../config/mail/mailController";
import { CartDTO, convertToCartDTO } from "../dto/CartDTO";
import { convertToOrderDTO, OrderDTO } from "../dto/OrderDTO";
import { convertToUserDTO, UserDTO } from "../dto/UserDTO";
import Cart from "../models/carts";
import Order from "../models/orders";
import User, { IUser } from "../models/users";
import { jwtService } from "./auxiliary/jwtService";
import bcrypt from 'bcryptjs';

export const userSelfAccessService = {

    getProfile: async (bearerToken: string): Promise<UserDTO> => {
        const user = await jwtService.getUserFromBearerToken(bearerToken);
        return convertToUserDTO(user);
    },

    updateProfile: async (bearerToken: string, userProps: {
        firstName: string,
        lastName: string,
        password?: string,
        phoneNumber: string
    }): Promise<UserDTO> => {

        const user = await jwtService.getUserFromBearerToken(bearerToken);

        if (userProps.password) {
            if (user.firstName !== userProps.firstName) user.firstName = userProps.firstName;
            if (user.lastName !== userProps.lastName) user.lastName = userProps.lastName;
            if (user.phoneNumber !== userProps.phoneNumber) user.phoneNumber = userProps.phoneNumber;

            const isTheSamePassword = bcrypt.compareSync(userProps.password, user.password);
            if (!isTheSamePassword) {
                mailController.sendPasswordChangedLetter(user.email);
                user.password = userProps.password;
                await user.save();
                return convertToUserDTO(user);
            }
        }

        const updatedUser = await User.findByIdAndUpdate(user._id, {
            firstName: userProps.firstName,
            lastName: userProps.lastName,
            phoneNumber: userProps.phoneNumber
        }, { returnDocument: 'after' }) as IUser;

        return convertToUserDTO(updatedUser);
    },

    getCart: async (bearerToken: string): Promise<CartDTO | null> => {
        const user = await jwtService.getUserFromBearerToken(bearerToken);
        const cart = await Cart.findOne({ userId: user.id });
        return cart ? convertToCartDTO(cart) : cart;
    },

    getOrders: async (bearerToken: string): Promise<OrderDTO[]> => {
        const user = await jwtService.getUserFromBearerToken(bearerToken);
        const orders = await Order.find({ userId: user._id });
        return orders
            .map(order => convertToOrderDTO(order));
    }
}