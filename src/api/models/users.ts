import mongoose from "mongoose";
import mongooseToSwagger from 'mongoose-to-swagger';
import { UserRoles } from "./enums/userRolesEnum";
import bcrypt from 'bcryptjs'
import { randomUUID, UUID } from "crypto";

export interface IUser extends mongoose.Document {
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    avatar: String;
    recoveryCode: UUID,
    recoveryCodeCreatedAt: Date,
    role: string,
    isVerified: Boolean,
    verificationCode: UUID,
    verificationCodeCreatedAt: Date,
    refreshToken: string,
    isOAuth: boolean
}

const userSchema: mongoose.Schema<IUser> = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'is required'],
        unique: [true, 'Email already used'],
        minlength: [10, 'must be at least 10 characters long'],
        maxlength: [40, 'cannot exceed 40 characters'],
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid format']
    },

    password: {
        type: String,
        required: function () {
            return !this.isOAuth;
        },
        minlength: [8, 'must be at least 8 characters long'],
        maxlength: [20, 'cannot exceed 20 characters'],
        match: [/^(?=.*[A-Z])(?=.*\d).+$/, 'invalid format']
    },

    firstName: {
        type: String,
        required: false,
        minlength: [3, 'must be at least 3 characters long'],
        maxlength: [15, 'cannot exceed 15 characters'],
    },

    lastName: {
        type: String,
        required: false,
        minlength: [5, 'must be at least 5 characters long'],
        maxlength: [20, 'cannot exceed 20 characters'],
    },

    avatar: {
        type: String,
        required: false
    },
    recoveryCode: {
        type: String,
        default: undefined
    },

    recoveryCodeCreatedAt: {
        type: Date
    },

    role: {
        type: String,
        enum: UserRoles,
        default: UserRoles.USER
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    verificationCode: {
        type: String
    },

    verificationCodeCreatedAt: {
        type: Date
    },

    refreshToken: {
        type: String
    },

    isOAuth: {
        type: Boolean,
        default: false
    }
})

userSchema.pre<IUser>('save', async function (next) {

    if (!this.isOAuth) {
        this.password = bcrypt.hashSync(this.password, 10);
    }

    if (!this.isVerified) {
        this.verificationCode = randomUUID();
        this.verificationCodeCreatedAt = new Date();
    }

    next();
})

const User: mongoose.Model<IUser> = mongoose.model<IUser>('User', userSchema);
export default User;
export const userSwaggerSchema = mongooseToSwagger(User);