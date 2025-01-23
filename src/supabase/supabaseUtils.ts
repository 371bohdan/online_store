import supabase from './supabaseService';

export const createBucketIfNotExists = async (bucketName: string): Promise<void> => {
    const { data, error } = await supabase.storage.getBucket(bucketName);
    if (error) {
        console.error(`Error checking bucket ${bucketName}:`, error);
        throw new Error(`Failed to check bucket: ${bucketName}`);
    }

    if (!data) {
        const { error: createError } = await supabase.storage.createBucket(bucketName);
        if (createError) {
            console.error(`Error creating bucket ${bucketName}:`, createError);
            throw new Error(`Failed to create bucket: ${bucketName}`);
        }
    }
};

export const uploadToSupabase = async (file: Express.Multer.File, bucketName: string): Promise<string | null> => {
    try {
        await createBucketIfNotExists(bucketName);

        const uniqueFileName = `uploads/${bucketName}/${Date.now()}_${file.originalname}`;
        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(uniqueFileName, file.buffer, { contentType: file.mimetype, cacheControl: "3600" });

        if (error) {
            console.error("Error uploading to Supabase:", error);
            return null;
        }

        const publicUrl = supabase.storage.from(bucketName).getPublicUrl(data.path).data?.publicUrl;
        return publicUrl || null;
    } catch (err) {
        console.error("Error during upload process:", err);
        return null;
    }
};

export const deleteFromSupabase = async (filePath: string): Promise<boolean> => {
    try {
        const bucketName = filePath.split("/")[0];
        const fileName = filePath.split("/").slice(1).join("/");

        if (!bucketName || !fileName) {
            console.error("Invalid file path provided:", filePath);
            return false;
        }

        const { data, error } = await supabase.storage.from(bucketName).remove([fileName]);
        if (error) {
            console.error("Error deleting from Supabase:", error);
            return false;
        }

        return true;
    } catch (err) {
        console.error("Unexpected error during file deletion:", err);
        return false;
    }
};

export default uploadToSupabase;
