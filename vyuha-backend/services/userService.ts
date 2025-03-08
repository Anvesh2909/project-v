import prisma from "../config/dbConfig";
import supabase from "../config/supabase";
export async function getUser(id: string) {
    const user = await prisma.user.findUnique({
        where: {
            id
        }
    });
    return user;
}
export async function updateUserPhoto(id: string, photoBuffer: Buffer, mimetype: string) {
    try {
        const bucketName = process.env.SUPABASE_BUCKET_NAME || "vyuha-uploads";
        const filePath = `public/${id}.${mimetype.split("/")[1]}`;
        const photoBlob = new Blob([photoBuffer], { type: mimetype });
        const { data, error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, photoBlob, {
                cacheControl: "3600",
                upsert: true,
            });
        console.log("Uploading to bucket:", bucketName);
        if (uploadError) {
            throw new Error(`Failed to upload image: ${uploadError.message}`);
        }
        const publicUrl = supabase.storage.from(bucketName).getPublicUrl(filePath).data.publicUrl;
        if (!publicUrl) {
            throw new Error("Failed to get public URL of the uploaded image");
        }
        const user = await prisma.user.update({
            where: { id },
            data: {
                image: publicUrl,
            },
        });
        return user;
    } catch (error) {
        console.error("Error updating user photo:", error);
        throw error;
    }
}
export async function getUsers(){
    const users = prisma.user.findMany();
    return users;
}