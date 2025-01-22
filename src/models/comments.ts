import mongoose, {Types, Schema} from 'mongoose';
import mongooseToSwagger from 'mongoose-to-swagger';

export interface IComment extends Document {
    product_id: Types.ObjectId; // Посилання на таблицю Product
    user_id: Types.ObjectId; // Посилання на таблицю Users
    message: string;
    rate: number;
    created_at: Date;
  }
  
  const CommentSchema = new Schema<IComment>({
    product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Ref до Users
    message: { type: String, required: true },
    rate: { type: Number, required: true, min: 0, max: 5 }, // Рейтинг від 0 до 5
    created_at: { type: Date, default: Date.now }, // Дата створення
  });
  
  export const Comment = mongoose.model<IComment>('Comment', CommentSchema);
  export const commentSwaggerSchema = mongooseToSwagger(Comment);
