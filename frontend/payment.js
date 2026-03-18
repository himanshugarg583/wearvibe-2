const getCookie = (name) => {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split("=");
        if (cookieName === name) return cookieValue;
    }
    return null;
};


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
        console.log(data);

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






document.addEventListener("DOMContentLoaded", function () {
    const avatarButton = document.getElementById("avatarButton");
    const userDropdown = document.getElementById("userDropdown");

    avatarButton.addEventListener("click", function () {
        userDropdown.classList.toggle("hidden");
    });

    document.addEventListener("click", function (event) {
        if (!avatarButton.contains(event.target) && !userDropdown.contains(event.target)) {
            userDropdown.classList.add("hidden");
        }
    });
});


document.getElementById('codOption').addEventListener('change', function() {
    let codAvailable = false; // Change this dynamically as needed
    document.getElementById('codMessage').classList.toggle('hidden', codAvailable);
});




