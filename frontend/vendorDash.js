const getCookie = (name) => {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split("=");
        if (cookieName === name) return cookieValue;
    }
    return null;
};




async function fetchOrderStats() {
    const token = getCookie("token");
    
    try {
        const response = await fetch("http://localhost:3000/api/getTodayOrder",{
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include"
        });
        const data = await response.json();
        console.log(data);

        document.getElementById("today-sales").innerText = `₹${Number(data.totalSales).toFixed(2)}`;
        document.getElementById("order-count").innerText = data.totalOrders;
        document.getElementById("revenue").innerText = `₹${Number(data.totalRevenue).toFixed(2)}`;
        
    } catch (error) {
        console.error("Error fetching order data:", error);
    }
}

// Page load hone par data fetch karega
window.onload = fetchOrderStats;
