import { Request, Response } from "express";
import Image, { ImageType } from "../models/images";
import uploadToSupabase, { createBucketIfNotExists, deleteFromSupabase } from "../supabase/supabaseUtils";

const imageController = {
  uploadImage: async (req: Request, res: Response): Promise<void> => {
    try {
      const file = req.file as Express.Multer.File;
      const { type, referenceId } = req.body;

      if (!file || !type || !referenceId) {
        res.status(400).json({ message: "File, type, and referenceId are required" });
        return;
      }

      if (!Object.values(ImageType).includes(type)) {
        res.status(400).json({ message: "Invalid image type" });
        return;
      }

      if (!/^[a-f\d]{24}$/i.test(referenceId)) {
        res.status(400).json({ message: "Invalid referenceId format" });
        return;
      }

      const bucketName = `${type}-images`;
      await createBucketIfNotExists(bucketName);

      const publicUrl = await uploadToSupabase(file, bucketName);

      if (!publicUrl) {
        res.status(500).json({ message: "Failed to upload image" });
        return;
      }

      const newImage = new Image({ url: publicUrl, type, referenceId });
      const savedImage = await newImage.save();

      res.status(201).json({ message: "Image uploaded successfully", image: savedImage });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Internal server error", error });
    }
  },

  deleteImage: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const image = await Image.findById(id);

      if (!image) {
        res.status(404).json({ message: "Image not found" });
        return;
      }

      const filePath = new URL(image.url).pathname.slice(1);
      const deleted = await deleteFromSupabase(filePath);

      if (!deleted) {
        res.status(500).json({ message: "Failed to delete image from storage" });
        return;
      }

      await image.deleteOne();
      res.status(200).json({ message: "Image deleted successfully" });
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ message: "Internal server error", error });
    }
  },

  getImagesByType: async (req: Request, res: Response): Promise<void> => {
    try {
      const { type } = req.params;
  
      // Перевіряємо, чи є значення `type` в ImageType
      if (!Object.values(ImageType).includes(type as ImageType)) {
        res.status(400).json({ message: "Invalid image type" });
        return;
      }
  
      // Приводимо `type` до типу `ImageType`
      const imageType = type as ImageType;
  
      const images = await Image.find({ type: imageType });
      res.status(200).json(images);
    } catch (error) {
      console.error("Error retrieving images by type:", error);
      res.status(500).json({ message: "Internal server error", error });
    }
  },
};

export default imageController;
