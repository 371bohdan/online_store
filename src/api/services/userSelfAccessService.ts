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

    updateProfile: async (bearerToken: string, body: any): Promise<UserDTO> => {
        const user = await jwtService.getUserFromBearerToken(bearerToken);
        user.firstName = body.firstName;
        user.lastName = body.lastName;

        if (body.password) {
            const isTheSamePassword = bcrypt.compareSync(body.password, user.password);
            if (!isTheSamePassword) {
                mailController.sendMail(user.email, 'Lumen Online Store: password changed', "Hello, your password has recently been changed. " +
                    "If you didn't change it, please contact our administration. \n Best Regards \nLumen Online Store Administration");
                user.password = body.password;
                await user.save();
            }
        }

        const updatedUser = await User.findByIdAndUpdate(user._id, {
            firstName: body.firstName,
            lastName: body.lastName
        }, { returnDocument: 'after' }) as IUser;

        return convertToUserDTO(updatedUser);
    },

    getCart: async (bearerToken: string): Promise<CartDTO | null> => {
        const user = await jwtService.getUserFromBearerToken(bearerToken);
        const cart = await Cart.findOne({ userId: user.id });

        /*   if (!cart) {
               throw new BadRequestError("You don't have any cart yet");
           }*/

        return cart ? convertToCartDTO(cart) : cart;
    },

    getOrders: async (bearerToken: string): Promise<OrderDTO[]> => {
        const user = await jwtService.getUserFromBearerToken(bearerToken);
        const orders = await Order.find({ userId: user._id });
        return orders
            .map(order => convertToOrderDTO(order));
    }
}