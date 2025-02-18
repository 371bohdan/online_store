import { Request } from "express";
import { IUser } from "../models/users"; // Припускаємо, що є модель IUser

export interface AuthRequest extends Request {
    user?: IUser; // Поле `user` є необов’язковим
}
