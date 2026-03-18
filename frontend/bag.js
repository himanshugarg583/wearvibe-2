const cartCount = document.getElementById('cart-count');
const favoriteCount = document.getElementById('favorite-count');

// Load cart and wishlist counts from local storage on page load
document.addEventListener("DOMContentLoaded", function () {
    const storedCartCount = localStorage.getItem('cartCount');
    const storedFavoriteCount = localStorage.getItem('favoriteCount');

    if (storedCartCount) {
        cartCount.innerText = storedCartCount;
    }

    if (storedFavoriteCount) {
        favoriteCount.innerText = storedFavoriteCount;
    }
});



function addToWishlist(itemName, itemPrice, itemImage) {
    // Check if the item already exists in the wishlist
    let wishlistItems = JSON.parse(localStorage.getItem('wishlistItems')) || [];
    const existingItemIndex = wishlistItems.findIndex(item => item.name === itemName);

    if (existingItemIndex === -1) {
        // If the item does not exist, add it to the wishlist
        wishlistItems.push({ name: itemName, price: itemPrice, image: itemImage });
        alert(`${itemName} has been added to your wishlist!`);
    } else {
        alert(`${itemName} is already in your wishlist!`);
    }

    // Save updated wishlist to local storage
    localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems));

    // Update wishlist count
    const favoriteCount = document.getElementById('favorite-count');
    favoriteCount.innerText = wishlistItems.length;
    localStorage.setItem('favoriteCount', favoriteCount.innerText); // Store the updated count in local storage
}

function removeFromWishlist(itemName) {
    let wishlistItems = JSON.parse(localStorage.getItem('wishlistItems')) || [];
    wishlistItems = wishlistItems.filter(item => item.name !== itemName);
    localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems));

    // Update wishlist count
    const favoriteCount = document.getElementById('favorite-count');
    favoriteCount.innerText = wishlistItems.length;
    localStorage.setItem('favoriteCount', favoriteCount.innerText); // Store the updated count in local storage

    alert(`${itemName} has been removed from your wishlist!`);
}

function shareProduct(productName) {
    const url = `https://wa.me/?text=Check out this product: ${productName}`;
    window.open(url, '_blank');
}

// Search functionality for color
document.getElementById('colorSearch').addEventListener('input', function() {
    const searchValue = this.value.toLowerCase();
    const colorButtons = document.querySelectorAll('#colorOptions button');
    colorButtons.forEach(button => {
        const color = button.style.backgroundColor;
        if (color.toLowerCase().includes(searchValue)) {
            button.style.display = 'inline-block';
        } else {
            button.style.display = 'none';
        }
    });
});

// Search functionality for brands
document.getElementById('brandSearch').addEventListener('input', function() {
    const searchValue = this.value.toLowerCase();
    const brandLabels = document.querySelectorAll('#brandOptions label');
    brandLabels.forEach(label => {
        const brandText = label.innerText.toLowerCase();
        if (brandText.includes(searchValue)) {
            label.style.display = 'flex';
        } else {
            label.style.display = 'none';
        }
    });
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