import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/aws.config";



export const getPresigned = async (key: string) => {
    const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key as string,
    });

    const signedUrl = await getSignedUrl(s3, command, {
        expiresIn: 24 * 60 * 60, // seconds (1 hour) max 7 days
    });
    return signedUrl;
}