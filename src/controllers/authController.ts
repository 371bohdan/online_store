import { Request, Response } from "express";
import bcrypt from 'bcryptjs'
import User from "../models/users";
import mailController from "../mail/mailController";

const authController = {
    signUp: async (req: Request, res: Response): Promise<void> => {
        const encodedPassword = bcrypt.hashSync(req.body.password, 10);
        req.body.password = encodedPassword;

        const isUserExist = await User.findOne({ email: req.body.email });

        if (isUserExist) {
            res.status(400).json("The email already used.")
        } else {
            const createdUser = await User.create(req.body);
            mailController.sendMail(req.body.email, 'Registration on the Lumen online store',
                'Your account has been successfully created. Have fun!');
            res.json(createdUser);
        }
    }
}

export default authController;