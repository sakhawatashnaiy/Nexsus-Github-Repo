import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, index: true, unique: true },
    name: { type: String, required: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
        type: String,
        required: true,
        enum: ['entrepreneur', 'investor', 'admin'],
        default: 'entrepreneur',
    },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
const existing = mongoose.models.User;
export const UserModel = existing ?? mongoose.model('User', userSchema);
