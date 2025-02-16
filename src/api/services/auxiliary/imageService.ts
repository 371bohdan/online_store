import { StatusCodes } from "http-status-codes";
import { ENV } from "../../../config/dotenv/env";
import supabase from "../../../config/supabase/supabaseConfig";
import ImageUploadError from "../../errors/general/ImageUploadError";

export const imageService = {
    uploadFile: async (file: Express.Multer.File): Promise<string> => {
        const fileName = `${Date.now()}_${file.originalname}`;

        const { data, error } = await supabase
            .storage
            .from(ENV.SUPABASE_BUCKET_NAME)
            .upload(fileName, file.buffer, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Error upon upload to Supabase:', error);
            throw new ImageUploadError(StatusCodes.INTERNAL_SERVER_ERROR, 'The error occurred while uploading a file');
        }

        const { data: publicUrlData } = supabase.storage.from(ENV.SUPABASE_BUCKET_NAME).getPublicUrl(fileName);

        return publicUrlData.publicUrl;
    },
}