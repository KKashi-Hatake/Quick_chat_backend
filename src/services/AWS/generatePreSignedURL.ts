import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import AsyncHandler from '../../middlewares/AsyncHandler';
import { Request, Response } from 'express';
import { s3 } from '../../config/aws.config';

export const generatePresignedUrl = AsyncHandler(async (req: Request, res: Response) => {
  const { key } = req.query; // e.g. profile_pic/user123.png

  if (!key) return res.status(400).json({ error: 'Missing key' });

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key as string,
    });

    const signedUrl = await getSignedUrl(s3, command, {
      expiresIn: 60 * 60, // seconds (1 hour) max 7 days
    });

    res.status(200).json({ url: signedUrl });
  } catch (err) {
    console.error('Error generating presigned URL:', err);
    res.status(500).json({ error: 'Failed to generate URL' });
  }
});
