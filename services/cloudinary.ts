
// Security Note: Never expose API Secret on frontend.
// Used Unsigned Upload preset.
// Setup: Cloudinary Dashboard -> Settings -> Upload -> Add upload preset -> Signed mode: Unsigned -> Name: gsn_unsigned

const CLOUD_NAME = "djg0vtztq";
const UPLOAD_PRESET = "gsn_unsigned"; // Action: Create this in Cloudinary Dashboard

export const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    
    // Add folder structure
    formData.append("folder", "gsn_user_uploads");

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Upload failed");
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw error;
    }
};
