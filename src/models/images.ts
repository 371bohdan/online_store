import mongoose, { Schema, Document, Types } from 'mongoose';
import mongooseToSwagger from 'mongoose-to-swagger'

enum ImageType {
    Product = 'product',
    UserAvatar = 'userAvatar',
    // Можна додавати інші типи
}

interface IImage extends Document {
    url: string;
    type: ImageType;  // Тип зображення (продукт чи аватар)
    referenceId: Types.ObjectId;  // Вказує на продукт або користувача
    createdAt: Date;
}

const imageSchema: Schema<IImage> = new Schema<IImage>({
    url: { type: String, required: true },
    type: { 
        type: String, 
        enum: Object.values(ImageType), 
        required: true 
    },
    referenceId: { 
        type: Schema.Types.ObjectId, 
        required: true, 
        refPath: 'type' // Це дозволяє зв'язати з конкретною моделлю (User або Product)
    },
    createdAt: { 
        type: Date, 
        default: Date.now
    }
});

const Image: mongoose.Model<IImage> = mongoose.model<IImage>('Image', imageSchema);
export default Image;
export const imageSwaggerSchema = mongooseToSwagger(Image);

export { ImageType };
