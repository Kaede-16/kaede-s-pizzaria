// ========================================
// CART
// ========================================

let cart = JSON.parse(
    localStorage.getItem("kaedesCart")
) || [];

// Make sure cart is always an array
if (!Array.isArray(cart)) {
    cart = [];
}
// ========================================
// CART IMAGE
// ========================================

function getCartImage(image, name) {

    if (!image) {
        return "🍕";
    }

    // URL image
    if (
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {
        return `
            <img
                src="${image}"
                alt="${name}"
                onerror="this.style.display='none'; this.parentElement.textContent='🍕';"
            >
        `;
    }

    // Emoji / text image
    return `<span>${image}</span>`;
}
// ========================================
// ADD TO CART
// ========================================

function addToCart(item) {

    cart.push(item);

    localStorage.setItem(
        "kaedesCart",
        JSON.stringify(cart)
    );

    renderCart();
}

// RENDER CART

function renderCart() {

    const cartItems =
        document.getElementById("cartItems");

    const cartSubtotal =
        document.getElementById("cartSubtotal");

    const cartTotal =
        document.getElementById("cartTotal");


    // Empty cart

    if (cart.length === 0) {
        const deliveryFeeElement =
    document.getElementById("deliveryFee");
        

        cartItems.innerHTML = `
            <div class="empty-cart">

                <span>🛒</span>

                <h3>
                    Your cart is empty
                </h3>

                <p>
                    Add a pizza to start your order.
                </p>

            </div>
        `;

        cartSubtotal.textContent = "R$ 0.00";
        deliveryFeeElement.textContent = "R$ 0.00";
        cartTotal.textContent = "R$ 0.00";
        
        

        return;
    }

    // Render items

    cartItems.innerHTML =
        cart.map(
            (item, index) => `

            <article class="cart-item">

                <div class="cart-item-image">
                    ${getCartImage(item.image, item.pizza)}
                </div>

                <div class="cart-item-info">

                    <h3>
                        ${item.pizza}
                    </h3>

                    <div class="cart-item-type">
                        ${item.type}
                    </div>

                    ${item.flavors && item.flavors.length
    ? `<div class="cart-item-flavors">${item.flavors.join(" + ")}</div>`
    : ""}
${
    item.crust
        ? `
            <div class="cart-item-crust">
                Crust: ${item.crust}
            </div>
        `
        : ""
}

                    ${
                        item.notes
                            ? `
                                <div class="cart-item-notes">
                                    Note: ${item.notes}
                                </div>
                            `
                            : ""
                    }

                </div>


                <div class="cart-item-quantity">

                    <button
                        onclick="changeCartQuantity(${index}, -1)"
                    >
                        −
                    </button>

                    <span>
                        ${item.quantity}
                    </span>

                    <button
                        onclick="changeCartQuantity(${index}, 1)"
                    >
                        +
                    </button>

                </div>


                <div class="cart-item-price">
                    R$ ${item.total.toFixed(2)}
                </div>


                <button
                    class="remove-cart-item"
                    onclick="removeCartItem(${index})"
                >
                    ×
                </button>

            </article>
        `
        ).join("");


    updateCartTotals();
}

// TOTALS

function updateCartTotals() {

    const cartSubtotal =
        document.getElementById("cartSubtotal");

    const deliveryFeeElement =
        document.getElementById("deliveryFee");

    const cartTotal =
        document.getElementById("cartTotal");

// Subtotal

    const subtotal =
        cart.reduce(
            (sum, item) => sum + item.total,
            0
        );

        // Delivery
        const deliveryFee =
            cart.length > 0 ? 5 : 0;

        const total = subtotal + deliveryFee;

            // update HTML


    cartSubtotal.textContent =
        `R$ ${subtotal.toFixed(2)}`;

    deliveryFeeElement.textContent =
        `R$ ${deliveryFee.toFixed(2)}`;

    cartTotal.textContent =
        `R$ ${total.toFixed(2)}`;
}

// CHANGE QUANTITY

function changeCartQuantity(index, change) {

    const item = cart[index];

    if (!item) {
        return;
    }


    item.quantity += change;


    if (item.quantity <= 0) {

        cart.splice(index, 1);

    } else {

        item.total =
            item.unitPrice * item.quantity;
    }
    localStorage.setItem(
    "kaedesCart",
    JSON.stringify(cart)
);


    renderCart();
}

// REMOVE ITEM

function removeCartItem(index) {

    cart.splice(index, 1);

    localStorage.setItem(
        "kaedesCart",
        JSON.stringify(cart)
    );

    renderCart();
}

// INITIALIZE

renderCart();

// CHECKOUT

const checkoutButton = document.getElementById("checkoutButton");

const checkoutModal = document.getElementById("checkoutModal");

const closeCheckoutModal = document.getElementById("closeCheckoutModal");

checkoutButton.addEventListener("click", () => {
    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }
    openCheckout();
});

closeCheckoutModal.addEventListener("click", () => {
    checkoutModal.classList.remove("active");
});
    checkoutModal.addEventListener("click", (event) => {
    if(event.target === checkoutModal) {
        checkoutModal.classList.remove("active");
    }
});
function openCheckout(){
    checkoutModal.classList.add("active");

    document.getElementById("checkoutSubtotal").textContent = document.getElementById("cartSubtotal").textContent;
    document.getElementById("checkoutDeliveryFee").textContent = document.getElementById("deliveryFee").textContent;
    document.getElementById("checkoutTotal").textContent = document.getElementById("cartTotal").textContent;
}

/// PLACE ORDER
const placeOrderButton = document.getElementById("placeOrderButton");


placeOrderButton.addEventListener("click", () => {
    const name = document.getElementById("customerName").value.trim();
    const phone = document.getElementById("customerPhone").value.trim();
    const street = document.getElementById("customerStreet").value.trim();
    const number = document.getElementById("customerNumber").value.trim();
    const neighborhood = document.getElementById("customerNeighborhood").value.trim();
    const complement = document.getElementById("customerComplement").value.trim();
const paymentOptions =
    document.getElementsByName("paymentMethod");

let payment = null;

for (let i = 0; i < paymentOptions.length; i++) {

    if (paymentOptions[i].checked) {

        payment = paymentOptions[i];

        break;
    }

}
    // VALIDATION
    if(!name) {
        alert("Please enter your name.");
        document.getElementById("customerName").focus();
        return;
    }
    if (!phone) {
        alert("Please enter your phone number.");
        document.getElementById("customerPhone").focus();
        return;
    }
    if (!street) {
        alert("Please enter your street.");
        document.getElementById("customerStreet").focus();
        return;
    }
    if (!number) {
        alert("Please enter your house number.");
        document.getElementById("customerNumber").focus();
        return;
    }
    if (!neighborhood) {
        alert("Please enter your neighborhood.");
        document.getElementById("customerNeighborhood").focus();
        return;
    }
    if (!payment) {
        alert("Please select a payment method.");
        return;
    }

    // ORDER DATA
    const order = {
        id:
        "KAE-" +
        Math.floor(
            1000 + Math.random() * 9000
        ),
        customer: {
            name: name,
            phone: phone,

            address: {
                street: street,
                number: number,
                neighborhood: neighborhood,
                complement: complement
            }
    },
    paymentMethod: payment.value,
    items: [...cart],
    subtotal: cart.reduce(
        (sum, item) => sum + item.total,
        0
    ),
    deliveryFee: cart.length > 0 ? 5 : 0,
    total: cart.reduce(
        (sum, item) => sum + item.total,
        0
    ) + (cart.length > 0 ? 5 : 0),

    status: "Pending",
    date: new Date().toISOString()
    };

    // SAVE ORDER

const orders =
    JSON.parse(
        localStorage.getItem("kaedesOrders")
    ) || [];

orders.push(order);

localStorage.setItem(
    "kaedesOrders",
    JSON.stringify(orders)
);

// Keep the last order separately
localStorage.setItem(
    "kaedesLastOrder",
    JSON.stringify(order)
);
    console.log("ORDER CREATED:", order);
    showOrderConfirmation(order);
});
// ORDER CONFIRMATION

const orderConfirmationModal = document.getElementById("orderConfirmationModal");
const closeConfirmationModal = document.getElementById("closeConfirmationModal");
const backToMenuButton = document.getElementById("backToMenuButton");

// SHOW CONFIRMATION

function showOrderConfirmation(order) {
    document.getElementById("confirmationName").textContent = order.customer.name;
    document.getElementById("confirmationOrderId").textContent = order.id;
    document.getElementById("confirmationSubtotal").textContent = `R$ ${order.subtotal.toFixed(2)}`;
    document.getElementById("confirmationTotal").textContent = `R$ ${order.total.toFixed(2)}`;
    document.getElementById("confirmationPayment").textContent = order.paymentMethod;

// ITEMS
   const confirmationItems = document.getElementById("confirmationItems");

   confirmationItems.innerHTML = order.items.map(item => `
    <div class="confirmation-item">
       <div class="confirmation-item-image">${getCartImage(item.image, item.pizza)}</div>
       <div class="confirmation-item-info">
       <strong>${item.pizza}</strong>

       
<span>
    ${item.quantity} ×
    ${item.flavors && item.flavors.length
        ? item.flavorsjoin(" + ")
        : item.pizza
    }
    ${item.crust ? ` | Crust: ${item.crust}` : ""}
</span>
       </div>
       <div class="confirmation-item-price"> R$ ${item.total.toFixed(2)}</div>
    </div>
    
    `).join("");

    // OPEN
    orderConfirmationModal.classList.add("active");
}
// ==============================
// CLOSE CONFIRMATION
// ==============================

closeConfirmationModal.addEventListener(
    "click",
    () => {

        orderConfirmationModal
            .classList.remove("active");

    }
);


orderConfirmationModal.addEventListener(
    "click",
    (event) => {

        if (event.target === orderConfirmationModal) {

            orderConfirmationModal
                .classList.remove("active");

        }

    }
);


backToMenuButton.addEventListener(
    "click",
    () => {

        orderConfirmationModal
            .classList.remove("active");

        document
            .getElementById("promotions")
            .scrollIntoView({
                behavior: "smooth"
            });

    }
);