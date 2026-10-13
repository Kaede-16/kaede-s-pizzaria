// ========================================
// ADMIN DASHBOARD
// ========================================


// ========================================
// LOAD ORDERS
// ========================================

const orders =
    JSON.parse(
        localStorage.getItem("kaedesOrders")
    ) || [];


// ========================================
// DASHBOARD ELEMENTS
// ========================================

const statCards =
    document.querySelectorAll(".stat-card");

    console.log("STAT CARDS:", statCards.length);

// ========================================
// UPDATE DASHBOARD STATISTICS
// ========================================

function updateDashboardStats() {

    const totalOrders =
        orders.length;

    const pendingOrders =
        orders.filter(
            order => order.status === "Pending"
        ).length;

    const preparingOrders =
        orders.filter(
            order => order.status === "Preparing"
        ).length;

    const deliveryOrders =
        orders.filter(
            order => order.status === "Out for delivery"
        ).length;

    const completedOrders =
        orders.filter(
            order => order.status === "Completed"
        ).length;

    const pizzasSold =
        orders.reduce(
            (total, order) => {

                return total +
                    order.items.reduce(
                        (quantity, item) =>
                            quantity + item.quantity,
                        0
                    );

            },
            0
        );

    const revenue =
        orders.reduce(
            (total, order) =>
                total + order.total,
            0
        );


    // ========================================
    // UPDATE DASHBOARD CARDS
    // ========================================

    document.getElementById("totalOrders")
        .textContent =
            totalOrders;

    document.getElementById("pendingOrders")
        .textContent =
            pendingOrders;

    document.getElementById("pizzasSold")
        .textContent =
            pizzasSold;

    document.getElementById("revenue")
        .textContent =
            `R$ ${revenue.toFixed(2)}`;


    // ========================================
    // UPDATE ORDER STATUS
    // ========================================

    document.getElementById("pendingStatusCount")
        .textContent =
            pendingOrders;

    document.getElementById("preparingStatusCount")
        .textContent =
            preparingOrders;

    document.getElementById("deliveryStatusCount")
        .textContent =
            deliveryOrders;

    document.getElementById("completedStatusCount")
        .textContent =
            completedOrders;
}

// ========================================
// SALES OVERVIEW
// ========================================

function renderSalesChart() {

    const salesChartBars =
        document.getElementById("salesChartBars");

    const salesChartLabels =
        document.getElementById("salesChartLabels");

    if (!salesChartBars || !salesChartLabels) {
        return;
    }

    // ========================================
    // CURRENT WEEK
    // ========================================

    const today = new Date();

    const currentDay =
        today.getDay();

    const monday =
        new Date(today);

    const difference =
        currentDay === 0
            ? -6
            : 1 - currentDay;

    monday.setDate(
        today.getDate() + difference
    );

    monday.setHours(
        0,
        0,
        0,
        0
    );

    // ========================================
    // CREATE 7 DAYS
    // ========================================

    const days = [];

    for (let i = 0; i < 7; i++) {

        const date =
            new Date(monday);

        date.setDate(
            monday.getDate() + i
        );

        days.push({
            date: date,
            revenue: 0
        });
    }

    // ========================================
    // CALCULATE DAILY REVENUE
    // ========================================

    orders.forEach(order => {

        if (!order.date) {
            return;
        }

        const orderDate =
            new Date(order.date);

        orderDate.setHours(
            0,
            0,
            0,
            0
        );

        const day =
            days.find(day =>
                day.date.getTime() ===
                orderDate.getTime()
            );

        if (day) {

            day.revenue +=
                Number(order.total) || 0;

        }

    });

    // ========================================
    // MAX REVENUE
    // ========================================

    const maxRevenue =
        Math.max(
            ...days.map(
                day => day.revenue
            ),
            1
        );

    // ========================================
    // RENDER BARS
    // ========================================

salesChartBars.innerHTML =
    days.map(day => {

        const height =
            (day.revenue / maxRevenue) * 100;

        const label =
            day.date.toLocaleDateString(
                "en-US",
                {
                    weekday: "short"
                }
            );

        return `
            <div
                class="sales-bar-wrapper"
                data-tooltip="${label} • R$ ${day.revenue.toFixed(2)}"
            >
                <div
                    class="sales-bar"
                    style="height: ${height}%"
                ></div>
            </div>
        `;
    }).join("");
    // ========================================
    // RENDER LABELS
    // ========================================

    salesChartLabels.innerHTML =
        days.map(day => {

            const label =
                day.date.toLocaleDateString(
                    "en-US",
                    {
                        weekday: "short"
                    }
                );

            return `
                <span>
                    ${label}
                </span>
            `;

        }).join("");
}

// ========================================
// LOAD STATISTICS
// ========================================

updateDashboardStats();
renderSalesChart();


// ========================================
// RECENT ORDERS
// ========================================

const recentOrdersTable =
    document.getElementById("recentOrdersTable");


function renderRecentOrders() {

    if (orders.length === 0) {

        recentOrdersTable.innerHTML = `
            <div class="empty-orders">
                <span>📦</span>
                <p>No orders yet.</p>
            </div>
        `;

        return;
    }


    const recentOrders =
        [...orders]
            .reverse()
            .slice(0, 5);


    recentOrdersTable.innerHTML = `

        <div class="table-header">

            <span>
                Order
            </span>

            <span>
                Customer
            </span>

            <span>
                Total
            </span>

            <span>
                Status
            </span>

        </div>

        ${recentOrders.map(order => `

           <div class="order-row" onclick="openOrderDetails('${order.id}')">

    <span>
        ${order.id}
    </span>

    <span>
        ${order.customer.name}
    </span>

    <strong>
        R$ ${order.total.toFixed(2)}
    </strong>

    <span class="order-status ${getStatusClass(order.status)}">
        ${order.status}
    </span>

</div>

        `).join("")}

    `;
}

// ========================================
// STATUS CLASS
// ========================================

function getStatusClass(status) {

    switch (status) {

        case "Pending":
            return "pending-status";

        case "Preparing":
            return "preparing-status";

        case "Out for delivery":
            return "delivery-status";

        case "Completed":
            return "completed-status";

        default:
            return "";
    }
}


renderRecentOrders();

// ========================================
// ORDER DETAILS
// ========================================

const orderDetailsModal =
    document.getElementById("orderDetailsModal");

const closeOrderDetails =
    document.getElementById("closeOrderDetails");

const detailsStatusSelect =
    document.getElementById("detailsStatusSelect");

const updateStatusButton =
    document.getElementById("updateStatusButton");

let selectedOrderId = null;
function openOrderDetails(orderId) {

    console.log("CLICKED ORDER:", orderId);

    selectedOrderId = orderId;

    const order =
        orders.find(order => order.id === orderId);


    console.log("FOUND ORDER:", order);


    if (!order) {

        console.log("Order not found:", orderId);

        return;
    }


    console.log("CUSTOMER:", order.customer);

    console.log("ADDRESS:", order.customer.address);

    console.log("ITEMS:", order.items);


    // ORDER ID

    document.getElementById("detailsOrderId")
        .textContent = order.id;


    // CUSTOMER

    document.getElementById("detailsCustomerName")
        .textContent =
            order.customer.name;


    // PHONE

    document.getElementById("detailsCustomerPhone")
        .textContent =
            order.customer.phone || "No phone";


    // ADDRESS

    const address =
        order.customer.address;


    document.getElementById("detailsCustomerAddress")
        .textContent =
            `${address.street}, ${address.number} - ${address.neighborhood}`;


    // PAYMENT

    document.getElementById("detailsPayment")
        .textContent =
            order.paymentMethod;


    // SUBTOTAL

    document.getElementById("detailsSubtotal")
        .textContent =
            `R$ ${order.subtotal.toFixed(2)}`;


    // DELIVERY

    document.getElementById("detailsDelivery")
        .textContent =
            `R$ ${order.deliveryFee.toFixed(2)}`;


    // TOTAL

    document.getElementById("detailsTotal")
        .textContent =
            `R$ ${order.total.toFixed(2)}`;


    // STATUS
detailsStatusSelect.value =
    order.status;


    // ORDER ITEMS

    const orderItems =
        document.getElementById("detailsOrderItems");


    orderItems.innerHTML =
        order.items.map(item => `

            <div class="details-item">

                <div>

                    <strong>
                        ${item.pizza}
                    </strong>

                    <span>
                        ${item.flavors.join(" + ")}
                    </span>

                </div>


                <div>

                    <span>
                        × ${item.quantity}
                    </span>

                    <strong>
                        R$ ${item.total.toFixed(2)}
                    </strong>

                </div>

            </div>

        `).join("");


    // OPEN MODAL

   orderDetailsModal.classList.add("active");

console.log(
    "MODAL:",
    orderDetailsModal
);

console.log(
    "MODAL CLASSES:",
    orderDetailsModal.className
);
}


// ========================================
// CLOSE ORDER DETAILS
// ========================================

closeOrderDetails.addEventListener(
    "click",
    () => {

        orderDetailsModal.classList.remove("active");

    }
);


orderDetailsModal.addEventListener(
    "click",
    event => {

        if (event.target === orderDetailsModal) {

            orderDetailsModal.classList.remove("active");

        }

    }
);

// ========================================
// UPDATE ORDER STATUS
// ========================================

updateStatusButton.addEventListener(
    "click",
    () => {

        const order =
            orders.find(
                order =>
                    order.id === selectedOrderId
            );

        if (!order) {
            console.log(
                "Order not found:",
                selectedOrderId
            );

            return;
        }

        // UPDATE STATUS
        order.status =
            detailsStatusSelect.value;

        // SAVE TO LOCAL STORAGE
        localStorage.setItem(
            "kaedesOrders",
            JSON.stringify(orders)
        );

        // UPDATE DASHBOARD
        updateDashboardStats();

        // UPDATE RECENT ORDERS
        renderRecentOrders();

        renderOrdersPage();
        

        // CLOSE MODAL
        orderDetailsModal.classList.remove(
            "active"
        );

        console.log(
            "STATUS UPDATED:",
            order.id,
            order.status
        );
    }
);
// ========================================
// ORDERS PAGE
// ========================================

const ordersPage =
    document.getElementById("ordersPage");

const ordersPageList =
    document.getElementById("ordersPageList");

const orderSearch =
    document.getElementById("orderSearch");

const orderStatusFilter =
    document.getElementById("orderStatusFilter");


// ========================================
// RENDER ORDERS PAGE
// ========================================

function renderOrdersPage() {

    if (!ordersPageList) {
        return;
    }

    const search =
        orderSearch.value
            .toLowerCase()
            .trim();

    const status =
        orderStatusFilter.value;

    const filteredOrders =
        orders.filter(order => {

            const orderId =
                String(order.id || "")
                    .toLowerCase();

            const customerName =
                String(order.customer?.name || "")
                    .toLowerCase();

            const matchesSearch =
                orderId.includes(search) ||
                customerName.includes(search);

            const matchesStatus =
                status === "all" ||
                order.status === status;

            return (
                matchesSearch &&
                matchesStatus
            );
        });

    // ========================================
    // NO RESULTS
    // ========================================

    if (filteredOrders.length === 0) {

        ordersPageList.innerHTML = `
            <div class="empty-orders">

                <span>📦</span>

                <p>
                    No orders found.
                </p>

            </div>
        `;

        return;
    }

    // ========================================
    // RENDER ORDERS
    // ========================================

    ordersPageList.innerHTML =

        [...filteredOrders]
            .reverse()
            .map(order => {

                const itemsQuantity =
                    order.items.reduce(
                        (total, item) =>
                            total + item.quantity,
                        0
                    );

                const formattedDate =
                    new Date(order.date)
                        .toLocaleDateString("en-US");

                return `

                    <div
                        class="orders-page-row"
                        onclick="openOrderDetails('${order.id}')"
                    >

                        <span>
                            ${order.id}
                        </span>

                        <span>
                            ${order.customer.name}
                        </span>

                        <span>
                            ${formattedDate}
                        </span>

                        <span>
                            ${itemsQuantity}
                        </span>

                        <strong>
                            R$ ${order.total.toFixed(2)}
                        </strong>

                        <span
                            class="order-status ${getStatusClass(order.status)}"
                        >
                            ${order.status}
                        </span>

                        <button
                            class="order-view-button"
                            onclick="
                                event.stopPropagation();
                                openOrderDetails('${order.id}')
                            "
                        >
                            View
                        </button>

                    </div>

                `;
            })
            .join("");
}

// ========================================
// SEARCH
// ========================================

orderSearch.addEventListener(
    "input",
    renderOrdersPage
);


// ========================================
// STATUS FILTER
// ========================================

orderStatusFilter.addEventListener(
    "change",
    renderOrdersPage
);


// ========================================
// PAGE NAVIGATION
// ========================================

const dashboardNav =
    document.getElementById("dashboardNav");
    const productsNav =
    document.getElementById("productsNav");

const productsPage =
    document.getElementById("productsPage");

const ordersNav =
    document.getElementById("ordersNav");

    const viewAllOrders = document.getElementById("viewAllOrders")


const dashboardSections =
    document.querySelectorAll(
        ".dashboard-welcome, .stats-grid, .dashboard-grid, .recent-orders"
    );


// ========================================
// SHOW PAGE
// ========================================

function showPage(page) {


    // DASHBOARD

    dashboardSections.forEach(section => {

        section.style.display =
            page === "dashboard"
                ? ""
                : "none";

    });


    // ORDERS

    if (ordersPage) {

        ordersPage.style.display =
            page === "orders"
                ? "block"
                : "none";

    }


    // NAVIGATION ACTIVE STATE

    if (dashboardNav) {

        dashboardNav.classList.toggle(
            "active",
            page === "dashboard"
        );

    }


    if (ordersNav) {

        ordersNav.classList.toggle(
            "active",
            page === "orders"
        );

    }

    // PRODUCTS

if (productsPage) {

    productsPage.style.display =
        page === "products"
            ? "block"
            : "none";

}
if (productsNav) {

    productsNav.classList.toggle(
        "active",
        page === "products"
    );

}

}
if (viewAllOrders) {
        viewAllOrders.addEventListener(
            "click",
            () => {
                showPage("orders")
            }
        )
    }

// ========================================
// DASHBOARD NAV
// ========================================

if (dashboardNav) {

    dashboardNav.addEventListener(
        "click",
        () => {

            showPage("dashboard");

        }
    );

}


// ========================================
// ORDERS NAV
// ========================================

if (ordersNav) {

    ordersNav.addEventListener(
        "click",
        () => {

            showPage("orders");

        }
    );

}

// ========================================
// PRODUCTS NAV
// ========================================

if (productsNav) {

    productsNav.addEventListener(
        "click",
        () => {
            showPage("products");
        }
    );

}


// ========================================
// INITIAL PAGE
// ========================================

showPage("dashboard");

renderOrdersPage();

// ========================================
// PRODUCT MODAL
// ========================================

const addProductButton =
    document.getElementById("addProductButton");

const productModal =
    document.getElementById("productModal");

const closeProductModal =
    document.getElementById("closeProductModal");

const cancelProductButton =
    document.getElementById("cancelProductButton");

const productForm =
    document.getElementById("productForm");



// ========================================
// CLOSE PRODUCT MODAL
// ========================================

function closeProductModalWindow() {

    productModal.classList.remove("active");

    productForm.reset();

}


if (closeProductModal) {

    closeProductModal.addEventListener(
        "click",
        closeProductModalWindow
    );

}


if (cancelProductButton) {

    cancelProductButton.addEventListener(
        "click",
        closeProductModalWindow
    );

}


// ========================================
// CLOSE WHEN CLICKING OUTSIDE
// ========================================

if (productModal) {

    productModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target === productModal
            ) {

                closeProductModalWindow();

            }

        }
    );

}


// ========================================
// PRODUCTS SYSTEM
// ========================================

const PRODUCTS_STORAGE_KEY = "kaedesProducts";

// ========================================
// PRODUCT ELEMENTS
// ========================================

const productsGrid =
    document.getElementById("productsGrid");

const productSearch =
    document.getElementById("productSearch");

const productCategoryFilter =
    document.getElementById("productCategoryFilter");

const productModalTitle =
    document.getElementById("productModalTitle");

const productModalDescription =
    document.getElementById("productModalDescription");

const productSaveButton =
    document.getElementById("productSaveButton");

// ========================================
// LOAD PRODUCTS
// ========================================

let products =
    JSON.parse(
        localStorage.getItem(PRODUCTS_STORAGE_KEY)
    ) || [];

// ========================================
// EDITING STATE
// ========================================

let editingProductId = null;

// ========================================
// SAVE PRODUCTS
// ========================================

function saveProducts() {

    localStorage.setItem(
        PRODUCTS_STORAGE_KEY,
        JSON.stringify(products)
    );

}

// ========================================
// FORMAT PRICE
// ========================================

function formatPrice(price) {

    return Number(price).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}

// ========================================
// CATEGORY LABEL
// ========================================

function getCategoryLabel(category) {

    if (category === "savory") {
        return "Savory";
    }

    if (category === "sweet") {
        return "Sweet";
    }

    if (category === "drinks") {
        return "Drinks";
    }
    
    if (category === "sides") {
        return "Sides";
    }

    return category;

}

// ========================================
// PRODUCT CARD
// ========================================

function createProductCard(product) {

    return `
        <article class="product-card">

            <div class="product-card-image">

         <img
          src="${product.image}"
          alt="${product.name}"
          onerror="this.onerror=null; this.src='https://placehold.co/600x400?text=No+Image';"
          >

                <span class="product-category">
                    ${getCategoryLabel(product.category)}
                </span>

            </div>


            <div class="product-card-content">

                <div class="product-card-heading">

                    <h3>
                        ${product.name}
                    </h3>

                    <strong>
                        ${formatPrice(product.price)}
                    </strong>

                </div>


                <p class="product-card-description">
                    ${product.description}
                </p>


                <div class="product-card-footer">

                    <span class="product-id">
                        #${product.id}
                    </span>

                    <div class="product-card-actions">

                        <button
                            type="button"
                            class="product-edit-button"
                            onclick="editProduct('${product.id}')"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="product-delete-button"
                            onclick="deleteProduct('${product.id}')"
                        >
                            Delete
                        </button>

                    </div>

                </div>

            </div>

        </article>
    `;

}

// ========================================
// RENDER PRODUCTS
// ========================================

function renderProducts() {

    if (!productsGrid) {
        return;
    }

    const search =
        productSearch
            ? productSearch.value
                .toLowerCase()
                .trim()
            : "";

    const category =
        productCategoryFilter
            ? productCategoryFilter.value
            : "all";


    const filteredProducts =
        products.filter(product => {

            const name =
                String(product.name || "")
                    .toLowerCase();

            const description =
                String(product.description || "")
                    .toLowerCase();

            const matchesSearch =
                name.includes(search) ||
                description.includes(search);

            const matchesCategory =
                category === "all" ||
                product.category === category;

            return (
                matchesSearch &&
                matchesCategory
            );

        });


    // ========================================
    // EMPTY STATE
    // ========================================

    if (filteredProducts.length === 0) {

        productsGrid.innerHTML = `
            <div class="products-empty">

                <div class="products-empty-icon">
                    🍕
                </div>

                <h3>
                    No products found
                </h3>

                <p>
                    ${
                        products.length === 0
                            ? "Add your first product to get started."
                            : "Try changing your search or category filter."
                    }
                </p>

            </div>
        `;

        return;
    }


    // ========================================
    // RENDER CARDS
    // ========================================

    productsGrid.innerHTML =
        filteredProducts
            .map(product =>
                createProductCard(product)
            )
            .join("");

}

// ========================================
// OPEN ADD PRODUCT MODAL
// ========================================

function openAddProductModal() {

    editingProductId = null;

    productForm.reset();

    productModalTitle.textContent =
        "Add Product";

    productModalDescription.textContent =
        "Create a new product for your menu.";

    productSaveButton.textContent =
        "Add Product";

    productModal.classList.add("active");

}

// ========================================
// OPEN EDIT PRODUCT MODAL
// ========================================

function editProduct(productId) {

    const product =
        products.find(
            product =>
                product.id === productId
        );

    if (!product) {
        return;
    }


    editingProductId = productId;


    // ========================================
    // FILL FORM
    // ========================================

    document.getElementById("productImage").value =
        product.image;

    document.getElementById("productName").value =
        product.name;

    document.getElementById("productDescription").value =
        product.description;

    document.getElementById("productPrice").value =
        product.price;

    document.getElementById("productCategory").value =
        product.category;


    // ========================================
    // CHANGE MODAL
    // ========================================

    productModalTitle.textContent =
        "Edit Product";

    productModalDescription.textContent =
        "Update the information of this product.";

    productSaveButton.textContent =
        "Save Changes";


    productModal.classList.add("active");

}

// ========================================
// DELETE PRODUCT
// ========================================

function deleteProduct(productId) {

    const product =
        products.find(
            product =>
                product.id === productId
        );

    if (!product) {
        return;
    }


    const confirmed =
        confirm(
            `Are you sure you want to delete "${product.name}"?`
        );


    if (!confirmed) {
        return;
    }


    products =
        products.filter(
            product =>
                product.id !== productId
        );


    saveProducts();

    renderProducts();

}

// ========================================
// SUBMIT PRODUCT FORM
// ========================================

if (productForm) {

    productForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            // ========================================
            // GET VALUES
            // ========================================

            const image =
                document
                    .getElementById("productImage")
                    .value
                    .trim();
            if (!image.startsWith("http://") && !image.startsWith("https://")) {
                alert("Please enter a valid image URL.");
                return;
            }

            const name =
                document
                    .getElementById("productName")
                    .value
                    .trim();

            const description =
                document
                    .getElementById("productDescription")
                    .value
                    .trim();

            const price =
                Number(
                    document
                        .getElementById("productPrice")
                        .value
                );

            const category =
                document
                    .getElementById("productCategory")
                    .value;


            // ========================================
            // VALIDATION
            // ========================================

            if (
                !image ||
                !name ||
                !description ||
                !price ||
                !category
            ) {

                alert(
                    "Please fill in all product fields."
                );

                return;

            }


            // ========================================
            // EDIT PRODUCT
            // ========================================

            if (editingProductId) {

                const product =
                    products.find(
                        product =>
                            product.id ===
                            editingProductId
                    );


                if (product) {

                    product.image =
                        image;

                    product.name =
                        name;

                    product.description =
                        description;

                    product.price =
                        price;

                    product.category =
                        category;

                }

            }


            // ========================================
            // CREATE PRODUCT
            // ========================================

            else {

                const newProduct = {

                    id:
                        `PROD-${Date.now()}`,

                    image:
                        image,

                    name:
                        name,

                    description:
                        description,

                    price:
                        price,

                    category:
                        category,

                    createdAt:
                        new Date().toISOString()

                };


                products.push(
                    newProduct
                );

            }


            // ========================================
            // SAVE
            // ========================================

            saveProducts();


            // ========================================
            // UPDATE UI
            // ========================================

            renderProducts();


            // ========================================
            // CLOSE MODAL
            // ========================================

            closeProductModalWindow();

        }
    );

}

// ========================================
// SEARCH PRODUCTS
// ========================================

if (productSearch) {

    productSearch.addEventListener(
        "input",
        renderProducts
    );

}

// ========================================
// FILTER PRODUCTS
// ========================================

if (productCategoryFilter) {

    productCategoryFilter.addEventListener(
        "change",
        renderProducts
    );

}

// ========================================
// UPDATE ADD PRODUCT BUTTON
// ========================================

if (addProductButton) {

    addProductButton.removeEventListener(
        "click",
        () => {}
    );

    addProductButton.onclick =
        openAddProductModal;

}

// ========================================
// INITIAL RENDER
// ========================================

renderProducts();

