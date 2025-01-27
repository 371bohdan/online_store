import mongoose, { Schema, Document, Types } from "mongoose";
import mongooseToSwagger from 'mongoose-to-swagger';

export interface IUser extends mongoose.Document {
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    avatar: String;
    recoveryId: string,
    role: string,
    isVerified: Boolean,
    verificationCode: string
}

const userSchema: mongoose.Schema<IUser> = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'is required'],
        unique: [true, 'already used'],
        minlength: [10, 'must be at least 10 characters long'],
        maxlength: [40, 'cannot exceed 40 characters'],
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid format']
    },

    password: {
        type: String,
        required: true,
        maxlength: 61
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
    recoveryId: {
        type: String,
        required: false,
        default: undefined
    },

    role: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    verificationCode: {
        type: String,
        required: true
    },
})

const User: mongoose.Model<IUser> = mongoose.model<IUser>('User', userSchema);
export default User;
export const userSwaggerSchema = mongooseToSwagger(User);