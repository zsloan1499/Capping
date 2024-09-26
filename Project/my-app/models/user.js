import mongoose, { Schema, models } from "mongoose";

const userSchema = new Schema({
    fName: {
        type: String,
        required: true,
    },
    lName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: false,
    },
}, { timestamps: true });

const User = models.User || mongoose.model("User", userSchema);

export default User;
