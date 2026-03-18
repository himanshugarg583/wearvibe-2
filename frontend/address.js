const getCookie = (name) => {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split("=");
        if (cookieName === name) return cookieValue;
    }
    return null;
};

async function saveAddress() {
    const addressData = {
        name: document.getElementById("name").value,
        address: document.getElementById("address").value,
        city: document.getElementById("city").value,
        state: document.getElementById("state").value,
        zip: document.getElementById("zip").value,
        phone: document.getElementById("phone").value,
        type: document.getElementById("type").value  // Home, Work, Other
    };

    try {
        const token = getCookie("token");
        const response = await fetch("http://localhost:3000/api/createAddress", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(addressData)
        });

        const result = await response.json();
        if (result.success) {
            alert("Address saved successfully!");
            toggleAddressForm(); // Close modal after saving
            loadUserAddresses(); // Reload addresses after saving
        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        console.error("Error saving address:", error);
    }
}

function toggleAddressForm() {
    const modal = document.getElementById('address-modal');


    modal.classList.toggle('hidden');
    if (modal.classList.contains('hidden')) {
        document.getElementById("address-form").reset();
        document.getElementById("addressId").value = ""; 
    }
}

document.getElementById("cancel-address-btn").addEventListener("click", function (event) {
    event.preventDefault(); 
    toggleAddressForm();  
});
document.getElementById('address-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('address-modal')) {
        toggleAddressForm();
    }
});





async function loadUserAddresses() {
    try {
        const token = getCookie("token");
        const response = await fetch("http://localhost:3000/api/getAddress", {
            method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
        });

        const result = await response.json();
        console.log(result);
        if (result.success) {
            displayAddresses(result.address);

        } else {
            console.error("Error fetching addresses:", result.message);
        }
    } catch (error) {
        console.error("Fetch address error:", error);
    }
}


function displayAddresses(address) {
    const addressList = document.getElementById("address-list");
    addressList.innerHTML = ""; // Clear existing addresses

    if (address.length === 0) {
        addressList.innerHTML = "<p class='text-gray-500'>Address not saved.</p>";
        return;
    }

    address.forEach((address, index) => {
        const addressDiv = document.createElement("div");
        addressDiv.className = "bg-gray-50 p-4 rounded-lg mb-2";

        addressDiv.innerHTML = `
            <label class="flex items-start space-x-3 cursor-pointer">
                <input type="radio" name="address" class="mt-1 form-radio" value="${address._id}" ${index === 0 ? 'checked' : ''}>
                <div>
                    <h3 class="text-lg font-medium">${address.type} - ${address.name}</h3>
                    <p class="text-gray-600">${address.address}, ${address.city}, ${address.state} - ${address.zip}</p>
                    <p class="text-gray-600">Phone: ${address.phone}</p>
                </div>
            </label>
              <div class="flex space-x-3 mt-2">
                <button onclick="openEditModal('${address._id}')" class="text-blue-600"> Edit</button>
                <button onclick="deleteAddress('${address._id}')" class="text-red-600"> Delete</button>
            </div>

        `;
        addressList.appendChild(addressDiv);
    });
}
document.addEventListener("DOMContentLoaded", loadUserAddresses);



document.getElementById("address-form").addEventListener("submit", function (event) {
    event.preventDefault(); 

    const addressId = document.getElementById("addressId").value; // Check if we have an address ID

    if (addressId) {
        updateAddress(); 
    } else {
        saveAddress(); 
    }
});




async function fetchCartData() {
    try {
        const token = getCookie("token");
        const res = await fetch("http://localhost:3000/api/getCart", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();
        if (data.success && Array.isArray(data.cart)) {
            const totalMRP = data.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const totalAmount = data.cart.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);
            const totalDiscount = totalMRP - totalAmount;

            document.getElementById("totalMRP").innerText = `₹${totalMRP.toFixed(2)}`;
            document.getElementById("totalDiscount").innerText = `-₹${totalDiscount.toFixed(2)}`;
            document.getElementById("totalAmount").innerText = `₹${totalAmount.toFixed(2)}`;
        }
    } catch (error) {
        console.log("Error fetching cart data:", error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    fetchCartData();
});

// 🔹 Payment Selection
document.getElementById("payButton").addEventListener("click", async function () {
    const codOption = document.getElementById("codOption");
    const prepaidOption = document.getElementById("prepaidOption");

    if (!codOption.checked && !prepaidOption.checked) {
        alert("⚠️ Please select a payment method before proceeding!");
        return;
    }

    const paymentMethod = codOption.checked ? "COD" : "Online";
    await startPayment(paymentMethod);
});

// 🔹 Start Payment Process

function getSelectedAddress() {
    const selectedAddress = document.querySelector('input[name="address"]:checked');
    return selectedAddress ? selectedAddress.value : null;
}


async function startPayment(paymentMethod) {
    try {
        const token = getCookie("token");
        const selectedAddressId = getSelectedAddress();

        if (!selectedAddressId) {
            alert("⚠️ Please select a delivery address before proceeding!");
            return;
        }

        const cartRes = await fetch("http://localhost:3000/api/getCart", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        const cartData = await cartRes.json();
        console.log(cartData,'cartdatayesss');
        if (!cartData.success) {
            alert("Cart fetch error!");
            return;
        }

        const totalMRP = cartData.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const totalAmount = cartData.cart.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);
        const totalDiscount = totalMRP - totalAmount;

        const orderDetails = {
            userId: cartData.userId,
            items: cartData.cart,
            totalMRP: paymentMethod === "Online" ? totalMRP * 100 : totalMRP,
            totalDiscount: paymentMethod === "Online" ? totalDiscount * 100 : totalDiscount,
            totalAmount: paymentMethod === "Online" ? totalAmount * 100 : totalAmount, 
            address: selectedAddressId,
            paymentMethod: paymentMethod
        };
        

        const res = await fetch("http://localhost:3000/api/createOrder", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(orderDetails)
        });

        const { success, order, razorpayOrderId } = await res.json();
        if (!success) {
            alert("Order creation failed!");
            return;
        }

        if (paymentMethod === "COD") {
            alert("Order Placed Successfully! 🎉");
            window.location.href = `/frontend/ordertracking.html?orderId=${order._id}`;
            return;
        }

        const options = {
            key: "rzp_test_fSRQZcG87Hnjz5",
            amount: order.totalAmount * 100,
            currency: "INR",
            name: "WearVibe",
            description: "Fashion Purchase",
            order_id: razorpayOrderId,
            handler: async function (response) {
                await verifyPayment(response, order._id);
            },
            prefill: { email: "aakibt554@gmail.com", contact: "7357322673" }
        };

        const rzp = new Razorpay(options);
        rzp.open();
    } catch (error) {
        console.error("Payment failed:", error);
    }
}


// 🔹 Verify Razorpay Payment
async function verifyPayment(response, orderId) {
    const token = getCookie("token");
    const verifyRes = await fetch("http://localhost:3000/api/verifyPayment", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ...response, orderId })
    });

    const data = await verifyRes.json();
    console.log(data);
    if (data.success) {
        alert("Payment Successful! 🎉");
        window.location.href = `/frontend/ordertracking.html?orderId=${orderId}`;
    } else {
        alert("Payment Failed! ❌");
    }
}



function toggleAddressForm() {
    const modal = document.getElementById('address-modal');
    modal.classList.toggle('hidden');
}


document.getElementById('add-address-btn').addEventListener('click', toggleAddressForm);
document.getElementById('cancel-address-btn').addEventListener('click', toggleAddressForm);


document.getElementById('address-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('address-modal')) {
        toggleAddressForm();
    }
});


async function openEditModal(addressId) {
    try {
        const token = getCookie("token");
        const response = await fetch(`http://localhost:3000/api/getSingleAddress/${addressId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const result = await response.json();
        if (result.success) {
            // Populate form with existing address data
            document.getElementById("name").value = result.address.name;
            document.getElementById("address").value = result.address.address;
            document.getElementById("city").value = result.address.city;
            document.getElementById("state").value = result.address.state;
            document.getElementById("zip").value = result.address.zip;
            document.getElementById("phone").value = result.address.phone;
            document.getElementById("type").value = result.address.type;
            
            // Set hidden field with Address ID
            document.getElementById("addressId").value = addressId;
            
            // Open Modal
            toggleAddressForm();
        } else {
            alert("Error fetching address details!");
        }
    } catch (error) {
        console.error("Fetch address error:", error);
    }
}



async function updateAddress() {
    const addressId = document.getElementById("addressId").value;
    const addressData = {
        name: document.getElementById("name").value,
        address: document.getElementById("address").value,
        city: document.getElementById("city").value,
        state: document.getElementById("state").value,
        zip: document.getElementById("zip").value,
        phone: document.getElementById("phone").value,
        type: document.getElementById("type").value  
    };

    try {
        const token = getCookie("token");
        const response = await fetch(`http://localhost:3000/api/updateAddress/${addressId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(addressData)
        });

        const result = await response.json();
        if (result.success) {
            alert("Address updated successfully!");
            loadUserAddresses(); // Refresh address list
            toggleAddressForm(); // Close Modal
        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        console.error("Error updating address:", error);
    }
}


document.getElementById("cancel-address-btn").addEventListener("click", function (event) {
    event.preventDefault(); 
    toggleAddressForm(); 
});




async function deleteAddress(addressId) {
    const confirmDelete = confirm("❌ Are you sure you want to delete this address?");
    if (!confirmDelete) return;

    try {
        const token = getCookie("token");
        const response = await fetch(`http://localhost:3000/api/deleteAddress/${addressId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const result = await response.json();
        if (result.success) {
            alert("✅ Address deleted successfully!");
            loadUserAddresses(); // Reload addresses
        } else {
            alert("⚠️ Error: " + result.message);
        }
    } catch (error) {
        console.error("Error deleting address:", error);
    }
}



