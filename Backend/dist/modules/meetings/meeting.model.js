import mongoose, { Schema } from 'mongoose';
const MeetingSchema = new Schema({
    organizerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    inviteeId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    participants: { type: [Schema.Types.ObjectId], ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    location: { type: String, trim: true },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true, index: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'cancelled'],
        default: 'pending',
        index: true,
    },
    decidedAt: { type: Date },
}, { timestamps: true });
// Query accelerator for conflict checks / calendar ranges
MeetingSchema.index({ participants: 1, startAt: 1, endAt: 1, status: 1 });
MeetingSchema.index({ organizerId: 1, updatedAt: -1 });
MeetingSchema.index({ inviteeId: 1, updatedAt: -1 });
export const MeetingModel = mongoose.model('Meeting', MeetingSchema);
