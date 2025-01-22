import mongoose, { Schema, Document, Types } from "mongoose";
import mongooseToSwagger from 'mongoose-to-swagger';

export interface IUser extends mongoose.Document {
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    avatar: Types.ObjectId; 
    recoveryId: string,
    role: string
}

const userSchema: mongoose.Schema<IUser> = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    firstName: {
        type: String,
        required: false
    },

    lastName: {
        type: String,
        required: false
    },

    avatar: { 
        type: Schema.Types.ObjectId, 
        ref: 'Image'  // Посилання на зображення
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
    }
})

const User: mongoose.Model<IUser> = mongoose.model<IUser>('User', userSchema);
export default User;
export const userSwaggerSchema = mongooseToSwagger(User);