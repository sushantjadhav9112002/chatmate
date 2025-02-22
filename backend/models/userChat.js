import mongoose from "mongoose";

const userchatsSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true
        },
        chats: [
            {
                _id: {
                    type: mongoose.Schema.Types.ObjectId,  // If storing ObjectId, otherwise keep String
                    required: true,
                },
                title: {
                    type: String,
                    required: true
                },
                createdAt: {
                    type: Date,
                    default: Date.now,  // Pass the Date.now function
                },
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.models.UserChats || mongoose.model("UserChats", userchatsSchema);
