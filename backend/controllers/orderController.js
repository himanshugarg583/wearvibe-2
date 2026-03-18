const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require('../models/orderSchema')
require("dotenv").config();
const Address = require('../models/AddressSchema')

// Razorpay instance create karo
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET


});


// Order create API
exports.createOrderController =  async (req, res) => {
    try {
        console.log(req.body,'vendor');
   
        const { userId,vendor, items, totalMRP, totalDiscount, totalAmount, address, paymentMethod } = req.body;

        if (!userId || !items || !totalAmount || !address || !paymentMethod) {
            return res.status(400).json({ success: false, message: "Missing required fields!" });
        }

        let razorpayOrderId = null;
        let paymentStatus = "Pending";

        // 🔹 If Online Payment, Create Razorpay Order
        if (paymentMethod === "Online") {
            const razorpayOrder = await razorpay.orders.create({
                amount: Math.round(totalAmount), // Convert to paise
                currency: "INR",
                payment_capture: 1
            });
            razorpayOrderId = razorpayOrder.id;
        } else {
            paymentStatus = "Paid"; // ✅ COD is always paid upfront
        }

        // 🔹 Save Order in Database
        const newOrder = new Order({
            userId,
            vendor,
            items,
            totalMRP,
            totalDiscount,
            totalAmount,
            address,
            paymentMethod,
            status: "Pending",
            paymentStatus,
            razorpayOrderId
        });

        const savedOrder = await newOrder.save();

        res.json({
            success: true,
            order: savedOrder,
            razorpayOrderId
        });
    } catch (error) {
        console.error("Order Creation Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.verifyPaymentController = async(req,res)=>{
    try {
        const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

        // 🔹 Validate Payment Signature
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Payment verification failed!" });
        }

        // 🔹 Update Order Status
        await Order.findByIdAndUpdate(orderId, { paymentStatus: "Paid", status: "Processing" });

        res.json({ success: true, message: "Payment verified!" });
    } catch (error) {
        console.error("Payment Verification Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }

}


exports.createAddressController = async(req,res)=>{
    try {
        const userId = req.user.userId
        console.log(userId,'hihiii');
        const {  name, address, city, state, zip, phone, type } = req.body;

        // Validation
        if (!name || !address || !city || !state || !zip || !phone || !type) {
            return res.status(400).json({ success: false, message: "All fields are required!" });
        }

        const existingAddresses = await Address.find({ userId });
        if (existingAddresses.length >= 3) {
            return res.status(400).json({ success: false, message: "You can only save up to 3 addresses." });
        }
        // Save to DB
        const newAddress = new Address({ userId, name, address, city, state, zip, phone, type });
        const savedAddress = await newAddress.save();

        res.json({ success: true, address: savedAddress });
    } catch (error) {
        console.error("Address Save Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}


exports.getUserAddressController = async (req, res) => {
    try {
        const userId = req.user.userId; // Get user ID from the request
        const address = await Address.find({ userId });

        res.json({ success: true, address });
    } catch (error) {
        console.error("Fetch Address Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};




// Get Single Address by ID (for Editing)
exports.getSingleAddressController = async (req, res) => {
    try {
        const { addressId } = req.params;
        const address = await Address.findById(addressId);

        if (!address) {
            return res.status(404).json({ success: false, message: "Address not found!" });
        }

        res.json({ success: true, address });
    } catch (error) {
        console.error("Fetch Address Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};



exports.updateAddressController = async (req, res) => {
    try {
        const { addressId } = req.params;
        const { name, address, city, state, zip, phone, type } = req.body;

        // Check if address exists
        const existingAddress = await Address.findById(addressId);
        if (!existingAddress) {
            return res.status(404).json({ success: false, message: "Address not found!" });
        }

        // Update the address
        const updatedAddress = await Address.findByIdAndUpdate(
            addressId,
            { name, address, city, state, zip, phone, type },
            { new: true, runValidators: true }
        );

        res.json({ success: true, message: "Address updated successfully!", address: updatedAddress });
    } catch (error) {
        console.error("Update Address Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};



exports.deleteAddressController = async (req, res) => {
    try {
        const { addressId } = req.params;
        await Address.findByIdAndDelete(addressId);
        res.json({ success: true, message: "Address deleted successfully!" });
    } catch (error) {
        console.error("Delete Address Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};



exports.getUserOrderDetailsController = async (req, res) => {


    try {
        const userId = req.user.userId; 
     

        // Fetch only the latest order
        const order = await Order.findOne({ userId }).sort({ createdAt: -1 }).populate("address");

        if (!order) {
            return res.status(404).json({ success: false, message: "No recent order found" });
        }

        res.json({ success: true, order });
    } catch (error) {
        console.error("Fetch Order Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};



