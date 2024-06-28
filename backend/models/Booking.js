import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
    name: {type: String, required: true},
    address: {type: String, required: true},
    packageSize: {type: String, required: true},
    trackingCode: {type: String, required: true},
    qrcode: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
},
{
    timestamps: true,
});

export const Booking = mongoose.model('Booking', BookingSchema);