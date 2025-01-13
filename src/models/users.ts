import mongoose from "mongoose";
import mongooseToSwagger from 'mongoose-to-swagger'

export interface IUser extends mongoose.Document {
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    avatar: string
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
        required: true
    },

    lastName: {
        type: String,
        required: false
    },

    avatar: {
        type: String,
        required: false
    }
})

const User: mongoose.Model<IUser> = mongoose.model<IUser>('User', userSchema);
export const userSwaggerSchema = mongooseToSwagger(User);
export default User;