import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Request, Response } from 'express';
import { s3 } from '../../config/aws.config';

export const deleteFileFromS3 = async (req: Request, res: Response) => {
  const { key } = req.query; // e.g. ?key=profile_pic/yourfilename.png

  if (!key || typeof key !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid S3 object key' });
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
    });

    await s3.send(command);

    res.status(200).json({ message: `Profile picture deleted successfully.` });
  } catch (error) {
    console.error('S3 delete error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
};
