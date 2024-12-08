import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';

// Configure AWS S3
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// API Route handler for uploading profile photo
export async function POST(req) {
    const formData = await req.formData(); // Use built-in form data handling
    const file = formData.get("file");

    if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const fileName = `${Date.now()}-${file.name}`; // Create a unique file name

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME, //  name of the S3 bucket
        Key: fileName, // File name (key) in S3 bucke
        Body: Buffer.from(await file.arrayBuffer()), // Use Buffer.from to handle file data correctly
        ContentType: file.type, // The file is a MIME type (who knows)
    };

    try {
        // Generate a presigned URL with a 7-day expiration(will update on its own when we login)
        const command = new PutObjectCommand(params);
        const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300000 }); // 604800 seconds = 7 days
        
        // Now you can use this presigned URL to upload the file directly to S3
        const uploadResponse = await fetch(presignedUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': file.type, // Set the correct MIME type
            },
            body: Buffer.from(await file.arrayBuffer()), // Send the file as the body
        });

        if (!uploadResponse.ok) {
            throw new Error('Failed to upload file to S3');
        }

        const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`; // Construct the image URL

        return NextResponse.json({ success: true, profilePhotoUrl: imageUrl });
    } catch (error) {
        console.error("Error uploading to S3: ", error);
        return NextResponse.json({ error: "Error uploading file" }, { status: 500 });
    }
}

// Export configuration for the API route
export const config = {
    api: {
        bodyParser: false, // Disable bodyParser so multer can handle form data
    },
};
