const express = require("express");
const router = express.Router();
const Order = require('../controllers/orderController')
 const authMiddleware = require('../middleware/authMiddleware')
 const roleMiddleware =  require('../middleware/roleMiddleware')



router.post("/createOrder", authMiddleware, Order.createOrderController )
router.post("/verifyPayment",authMiddleware, Order.verifyPaymentController )


// create user address before creating order
router.post("/createAddress", authMiddleware, Order.createAddressController )

// get user address 
router.get("/getAddress", authMiddleware, Order.getUserAddressController);

// get user orderDetails 
router.get("/getUserOrderDetails", authMiddleware, Order.getUserOrderDetailsController);


// update address 
router.get("/getSingleAddress/:addressId", authMiddleware, Order.getSingleAddressController);
router.put("/updateAddress/:addressId", authMiddleware, Order.updateAddressController)

// delete address
router.delete('/deleteAddress/:addressId', authMiddleware, Order.deleteAddressController)




module.exports = router;