import { S3Client, PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3"
import AsyncHandler from "../../middlewares/AsyncHandler";
import { Request, Response } from "express";
import fs from 'fs';
import { s3 } from "../../config/aws.config";




export const uploadFileToS3 = AsyncHandler(async (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    try {
        const fileContent = req.file.buffer;
        const key = `profile_pic/${Date.now()}_${req.file.originalname}`;
        const uploadParams:PutObjectCommandInput = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            Body: fileContent,
            ContentType: req.file.mimetype,
        };
        const publicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;
        const command = new PutObjectCommand(uploadParams);
        const data = await s3.send(command);
        

        res.status(200).json({ message: 'Uploaded to S3', key: req.file.originalname, url:key });
    } catch (err) {
        console.error('S3 upload error:', err);
        res.status(500).json({ error: 'Failed to upload to S3' });
    }
})