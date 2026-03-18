const getCookie = (name) => {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split("=");
        if (cookieName === name) return cookieValue;
    }
    return null;
};

async function fetchOrderDetails() {
    try {
        const token = getCookie("token");
        const response = await fetch("http://localhost:3000/api/getUserOrderDetails", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();
        
        if (!data.success || !data.order) {
            console.error("Order data not found");
            return;
        }
        
        console.log(data.order);
        const order = data.order;
        const address = order.address;

        // **Update Order Details**
        document.getElementById("order-id").innerText = `Order #${order._id}`;
        document.getElementById("total-amount").innerText = `₹${order.totalAmount.toFixed(2)}`;
        document.getElementById("payment-method").innerText = order.paymentMethod;
        document.getElementById("order-status").innerText = order.status;
        document.getElementById("phone").innerText = address.phone;

        // **Update Address in Uppercase**
        document.getElementById("customer-name").innerText = address.name.toUpperCase();
        document.getElementById("full-address").innerText = 
            `${address.address}, ${address.city}, ${address.state}, ${address.zip}, INDIA`.toUpperCase();

        // **Display Ordered Products**
        const itemsContainer = document.getElementById("order-items");
        itemsContainer.innerHTML = ""; // Clear existing items
        
        order.items.forEach(item => {
            const productDetailUrl = `/frontend/src/components/Admin/FrontendLanding/productdetail.html?id=${item.productId}`;
            
            const itemHTML = `
                <div class="p-4 flex hover:bg-gray-50 transition-colors border-b">
                    <img src="${item.image[0] || 'https://via.placeholder.com/100'}" 
                         alt="${item.name}" 
                         class="w-24 h-32 object-cover rounded-md hover:opacity-90 transition-opacity cursor-pointer"
                         onclick="window.location.href='${productDetailUrl}'" />
                    <div class="ml-4 flex-1">
                        <h4 class="font-semibold text-lg">${item.name}</h4>
                        <p class="text-gray-500 mt-1">Qty: ${item.quantity} | Sizes: ${item.sizes.join(", ") || 'N/A'}</p>
                        <p class="mt-1 font-bold">₹${item.finalPrice.toFixed(2)}</p>
                    </div>
                </div>
            `;
            itemsContainer.innerHTML += itemHTML;
        });

    } catch (error) {
        console.error("Error fetching order details:", error);
    }
}

// **Fetch Order Details on Page Load**
document.addEventListener("DOMContentLoaded", fetchOrderDetails);
