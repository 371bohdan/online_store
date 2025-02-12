import mongoose, { Schema, Document } from "mongoose";
import mongooseToSwagger from "mongoose-to-swagger";

export interface IDelivery extends Document {
    companyName: "NovaPosta" | "UkrPosta" | "MeestExpress";
    deliveryType: "to_home" | "to_branch"; 
    price: number;
}

const DeliverySchema = new Schema<IDelivery>(
    {
        companyName: {
            type: String,
            required: true,
            enum: ["NovaPosta", "UkrPosta", "MeestExpress"],
        },
        deliveryType: {
            type: String,
            required: true,
            enum: ["to_home", "to_branch"],
        },
        price: {
            type: Number,
            required: true,
            validate: {
                validator: (value: number) => value >= 0,
                message: "Price must be a positive number",
            },
        },
    }
);



const Delivery = mongoose.model<IDelivery>("Delivery", DeliverySchema);
export default Delivery;


export const deliverySwaggerSchema = mongooseToSwagger(Delivery);









// _id = NovaPosta, to_home, 100,
// _id = NovaPosta, to_branch, 110,
// _id = UkrPosta, to_home, 120,
// _id = UkrPosta, to_branch, 150,
// _id = MeestExpress, to_home, 170,
// _id = MeestExpress, to_branch, 120