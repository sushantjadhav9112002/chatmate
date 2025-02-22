import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true
        },
        history: [
            {
                role: {
                    type: String,
                    enum: ["user", "model"],
                    required: true,
                },
                parts: [
                    {
                        text: {
                            type: String,
                            required: true,
                        }
                    },
                ],
                img: {
                    type: String,
                    required: false,
                    default: "",  // Default empty string if image is not provided
                },
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.models.Chat || mongoose.model("Chat", chatSchema);
