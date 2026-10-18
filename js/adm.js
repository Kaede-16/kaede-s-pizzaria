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

    
function formatUSD(value) {
    return Number(value || 0).toLocaleString("en-US", {
        style: "currency",
        currency: "USD"
    });
}


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
            formatUSD(revenue);


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




function updateAnalyticsStats() {
    const analyticsRevenue =
        document.getElementById("analyticsRevenue");

    const analyticsOrders =
        document.getElementById("analyticsOrders");

    const analyticsItemsSold =
        document.getElementById("analyticsItemsSold");

    const analyticsCompleted =
        document.getElementById("analyticsCompleted");

    const revenueGrowth =
        document.getElementById("analyticsRevenueGrowth");

    const ordersGrowth =
        document.getElementById("analyticsOrdersGrowth");

    const periodFilter =
        document.getElementById("analyticsPeriodFilter");

    const period = Number(periodFilter?.value) || 7;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Current period: today and the previous (period - 1) days
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - period + 1);

    // Previous period: the same number of days immediately before
    const previousEndDate = new Date(startDate);
    previousEndDate.setDate(startDate.getDate() - 1);

    const previousStartDate = new Date(previousEndDate);
    previousStartDate.setDate(
        previousEndDate.getDate() - period + 1
    );

    // Parse dates using local calendar days
    function parseOrderDate(value) {
        if (!value) return null;

        const match = String(value).match(
            /^(\d{4})-(\d{2})-(\d{2})$/
        );

        const date = match
            ? new Date(
                Number(match[1]),
                Number(match[2]) - 1,
                Number(match[3])
            )
            : new Date(value);

        if (Number.isNaN(date.getTime())) {
            return null;
        }

        date.setHours(0, 0, 0, 0);

        return date;
    }

    // Filter current-period orders
    const filteredOrders = orders.filter(order => {
        const orderDate = parseOrderDate(order.date);

        return orderDate &&
            orderDate >= startDate &&
            orderDate <= today;
    });

    // Filter previous-period orders
    const previousOrders = orders.filter(order => {
        const orderDate = parseOrderDate(order.date);

        return orderDate &&
            orderDate >= previousStartDate &&
            orderDate <= previousEndDate;
    });

    // Calculate current revenue and orders
    const totalRevenue = filteredOrders.reduce(
        (total, order) =>
            total + (Number(order.total) || 0),
        0
    );

    const totalOrders = filteredOrders.length;

    // Calculate previous revenue and orders
    const previousRevenue = previousOrders.reduce(
        (total, order) =>
            total + (Number(order.total) || 0),
        0
    );

    const previousTotalOrders = previousOrders.length;

    // Calculate items sold in the current period
    const totalItemsSold = filteredOrders.reduce(
        (total, order) => {
            const items = Array.isArray(order.items)
                ? order.items
                : [];

            return total + items.reduce(
                (quantity, item) =>
                    quantity + (Number(item.quantity) || 0),
                0
            );
        },
        0
    );

    // Count completed orders in the current period
    const completedOrders = filteredOrders.filter(
        order => order.status === "Completed"
    ).length;

    // Safely calculate and display percentage growth
    function updateGrowth(element, current, previous) {
        if (!element) return;

        element.classList.remove(
            "growth-positive",
            "growth-negative",
            "growth-neutral"
        );

        // No sales in either period
        if (previous === 0 && current === 0) {
            element.textContent =
                "0.0% vs previous period";

            element.classList.add("growth-neutral");
            return;
        }

        // Previous period had no sales, but current period does
        if (previous === 0 && current > 0) {
            element.textContent =
                "New vs previous period";

            element.classList.add("growth-positive");
            return;
        }

        // Calculate percentage change
        const percentage =
            ((current - previous) / previous) * 100;

        if (percentage > 0) {
            element.textContent =
                `↑ ${percentage.toFixed(1)}% vs previous period`;

            element.classList.add("growth-positive");

        } else if (percentage < 0) {
            element.textContent =
                `↓ ${Math.abs(percentage).toFixed(1)}% vs previous period`;

            element.classList.add("growth-negative");

        } else {
            element.textContent =
                "0.0% vs previous period";

            element.classList.add("growth-neutral");
        }
    }

    // Update Analytics cards
    if (analyticsRevenue) {
        analyticsRevenue.textContent =
            formatUSD(totalRevenue);
    }

    if (analyticsOrders) {
        analyticsOrders.textContent = totalOrders;
    }

    if (analyticsItemsSold) {
        analyticsItemsSold.textContent = totalItemsSold;
    }

    if (analyticsCompleted) {
        analyticsCompleted.textContent = completedOrders;
    }

    // Update growth indicators
    updateGrowth(
        revenueGrowth,
        totalRevenue,
        previousRevenue
    );

    updateGrowth(
        ordersGrowth,
        totalOrders,
        previousTotalOrders
    );
}





/* ========================================
   ANALYTICS — BEST-SELLING PRODUCTS
======================================== */

function renderBestSellingProducts() {
    const productsList = document.getElementById(
        "bestSellingProductsList"
    );

    const emptyMessage = document.getElementById(
        "bestSellingEmpty"
    );

    const periodFilter = document.getElementById(
        "analyticsPeriodFilter"
    );

    if (!productsList || !emptyMessage || !periodFilter) {
        return;
    }

    // Get the selected period: 7, 30 or 90 days
    const period = Number(periodFilter.value) || 7;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - period + 1);

    // Parse order dates using local calendar days
    function parseOrderDate(value) {
        if (!value) return null;

        const match = String(value).match(
            /^(\d{4})-(\d{2})-(\d{2})$/
        );

        const date = match
            ? new Date(
                Number(match[1]),
                Number(match[2]) - 1,
                Number(match[3])
            )
            : new Date(value);

        if (Number.isNaN(date.getTime())) {
            return null;
        }

        date.setHours(0, 0, 0, 0);

        return date;
    }

    const productSales = {};

    // Analyze only orders within the selected period
    orders.forEach(order => {
        const orderDate = parseOrderDate(order.date);

        if (!orderDate || orderDate < startDate || orderDate > today) {
            return;
        }

        const items = Array.isArray(order.items)
            ? order.items
            : [];

        items.forEach(item => {
            const flavors = Array.isArray(item.flavors)
                && item.flavors.length > 0
                ? item.flavors
                : [item.pizza || "Unknown Product"];

            const quantity = Number(item.quantity) || 0;
            const itemRevenue = Number(item.total) || 0;

            // Split quantity and revenue for half-and-half pizzas
            const quantityPerFlavor = quantity / flavors.length;
            const revenuePerFlavor = itemRevenue / flavors.length;

            flavors.forEach(flavor => {
                const name = String(flavor).trim();

                if (!name) return;

                if (!productSales[name]) {
                    productSales[name] = {
                        name,
                        quantity: 0,
                        revenue: 0
                    };
                }

                productSales[name].quantity += quantityPerFlavor;
                productSales[name].revenue += revenuePerFlavor;
            });
        });
    });

    // Rank products by units sold
    const rankedProducts = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity);

    if (rankedProducts.length === 0) {
        productsList.innerHTML = "";
        emptyMessage.hidden = false;
        emptyMessage.textContent =
            `No product sales found in the last ${period} days.`;
        return;
    }

    emptyMessage.hidden = true;

    const totalRevenue = rankedProducts.reduce(
        (total, product) => total + product.revenue,
        0
    );

    const highestQuantity = Math.max(
        ...rankedProducts.map(product => product.quantity),
        1
    );

    productsList.innerHTML = rankedProducts
        .map((product, index) => {
            const percentage = totalRevenue > 0
                ? (product.revenue / totalRevenue) * 100
                : 0;

            const barWidth =
                (product.quantity / highestQuantity) * 100;

            return `
                <div class="best-selling-row">

                    <div class="best-selling-product">
                        <span class="best-selling-rank">
                            ${index + 1}
                        </span>

                        <div class="best-selling-product-info">
                            <strong>${product.name}</strong>

                            <div class="best-selling-progress">
                                <div
                                    class="best-selling-progress-fill"
                                    style="width: ${barWidth}%"
                                ></div>
                            </div>
                        </div>
                    </div>

                    <strong class="best-selling-quantity">
                        ${Number(product.quantity.toFixed(2))}
                    </strong>

                    <div class="best-selling-revenue">
                        <strong>${formatUSD(product.revenue)}</strong>
                        <span>${percentage.toFixed(1)}% of revenue</span>
                    </div>

                </div>
            `;
        })
        .join("");
}


/* ========================================
   ANALYTICS — ORDER INSIGHTS
======================================== */

function renderOrderInsights() {
    const chart = document.getElementById("orderInsightsChart");
    const totalElement = document.getElementById("orderInsightsTotal");
    const emptyMessage = document.getElementById("orderInsightsEmpty");
    const periodFilter = document.getElementById("analyticsPeriodFilter");

    if (!chart || !totalElement || !emptyMessage || !periodFilter) {
        return;
    }

    const period = Number(periodFilter.value) || 7;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - period + 1);

    // Convert order dates to local calendar days
    function parseOrderDate(value) {
        if (!value) return null;

        const match = String(value).match(
            /^(\d{4})-(\d{2})-(\d{2})$/
        );

        const date = match
            ? new Date(
                Number(match[1]),
                Number(match[2]) - 1,
                Number(match[3])
            )
            : new Date(value);

        if (Number.isNaN(date.getTime())) {
            return null;
        }

        date.setHours(0, 0, 0, 0);

        return date;
    }

    // Filter orders by the selected period
    const filteredOrders = orders.filter(order => {
        const orderDate = parseOrderDate(order.date);

        return orderDate &&
            orderDate >= startDate &&
            orderDate <= today;
    });

    // Count each order status
    const statuses = [
        {
            key: "pending",
            name: "Pending",
            color: "#f59e0b",
            countId: "insightsPendingCount",
            percentId: "insightsPendingPercent"
        },
        {
            key: "preparing",
            name: "Preparing",
            color: "#38bdf8",
            countId: "insightsPreparingCount",
            percentId: "insightsPreparingPercent"
        },
        {
            key: "delivery",
            name: "Out for delivery",
            color: "#a78bfa",
            countId: "insightsDeliveryCount",
            percentId: "insightsDeliveryPercent"
        },
        {
            key: "completed",
            name: "Completed",
            color: "#22c55e",
            countId: "insightsCompletedCount",
            percentId: "insightsCompletedPercent"
        }
    ];

    statuses.forEach(status => {
        status.count = filteredOrders.filter(
            order => order.status === status.name
        ).length;
    });

    const total = filteredOrders.length;

    totalElement.textContent = total;

    // Show an empty state if there are no orders
    if (total === 0) {
        chart.style.background = "#292929";
        emptyMessage.hidden = false;
    } else {
        emptyMessage.hidden = true;

        // Build the doughnut chart using a conic gradient
        let currentPercentage = 0;

        const gradientParts = statuses.map(status => {
            const percentage = (status.count / total) * 100;

            const start = currentPercentage;
            currentPercentage += percentage;

            return `${status.color} ${start}% ${currentPercentage}%`;
        });

        chart.style.background =
            `conic-gradient(${gradientParts.join(", ")})`;
    }

    // Update counts and percentages
    statuses.forEach(status => {
        const countElement = document.getElementById(status.countId);
        const percentElement = document.getElementById(status.percentId);

        const percentage = total > 0
            ? (status.count / total) * 100
            : 0;

        if (countElement) {
            countElement.textContent = status.count;
        }

        if (percentElement) {
            percentElement.textContent = `${percentage.toFixed(1)}%`;
        }
    });
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
                data-tooltip="${label} • ${formatUSD(day.revenue)}"
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


/* ========================================
   ANALYTICS — SALES CHART
======================================== */

function renderAnalyticsChart() {
    const canvas = document.getElementById("salesAnalyticsChart");
    const emptyMessage = document.getElementById("analyticsChartEmpty");
    const periodFilter = document.getElementById("analyticsPeriodFilter");

    if (!canvas || !emptyMessage || !periodFilter) {
        return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const period = Number(periodFilter.value) || 7;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    
    // Create the current period and its matching previous period
    const days = [];

    for (let i = period - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        const previousDate = new Date(date);
        previousDate.setDate(date.getDate() - period);

        days.push({
            date,
            previousDate,
            revenue: 0,
            orders: 0,
            previousRevenue: 0,
            previousOrders: 0
        });
    }

    // Convert dates to local calendar days
    function parseOrderDate(value) {
        if (!value) return null;

        const match = String(value).match(
            /^(\d{4})-(\d{2})-(\d{2})$/
        );

        const date = match
            ? new Date(
                Number(match[1]),
                Number(match[2]) - 1,
                Number(match[3])
            )
            : new Date(value);

        if (Number.isNaN(date.getTime())) {
            return null;
        }

        date.setHours(0, 0, 0, 0);
        return date;
    }

    // Calculate current and previous period values
    orders.forEach(order => {
        const orderDate = parseOrderDate(order.date);
        if (!orderDate) return;

        const day = days.find(item =>
            item.date.getTime() === orderDate.getTime()
        );

        if (day) {
            day.revenue += Number(order.total) || 0;
            day.orders += 1;
            return;
        }

        const previousDay = days.find(item =>
            item.previousDate.getTime() === orderDate.getTime()
        );

        if (previousDay) {
            previousDay.previousRevenue += Number(order.total) || 0;
            previousDay.previousOrders += 1;
        }
    });


    const hasOrders = days.some(day =>
        day.orders > 0 || day.previousOrders > 0
);

    emptyMessage.hidden = hasOrders;
    canvas.style.visibility = hasOrders ? "visible" : "hidden";

    if (!hasOrders) return;

    // Prepare a sharp canvas for the current screen size
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const ratio = window.devicePixelRatio || 1;

    if (!width || !height) return;

    canvas.width = width * ratio;
    canvas.height = height * ratio;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const left = 58;
    const right = width - 42;
    const top = 24;
    const bottom = height - 38;
    const chartWidth = right - left;
    const chartHeight = bottom - top;

    const maxRevenue = Math.max(
    ...days.flatMap(day => [
        day.revenue,
        day.previousRevenue
    ]),
    1
);

const maxOrders = Math.max(
    ...days.flatMap(day => [
        day.orders,
        day.previousOrders
    ]),
    1
);

    const money = value => value.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
    });

    // Horizontal grid and vertical-axis labels
    ctx.font = "11px Arial";
    ctx.textBaseline = "middle";

    for (let i = 0; i <= 4; i++) {
        const y = top + (chartHeight / 4) * i;

        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(left, y);
        ctx.lineTo(right, y);
        ctx.stroke();

        const revenueValue = maxRevenue * (1 - i / 4);
        const orderValue = Math.round(maxOrders * (1 - i / 4));

        ctx.fillStyle = "#a1a1aa";
        ctx.textAlign = "right";
        ctx.fillText(money(revenueValue), left - 9, y);

        ctx.textAlign = "left";
        ctx.fillText(String(orderValue), right + 8, y);
    }

    // Calculate positions for each day
    
    // Calculate positions for both periods
    const points = days.map((day, index) => ({
        x: left + (
            days.length === 1
                ? chartWidth / 2
                : (index / (days.length - 1)) * chartWidth
        ),

        revenueY: bottom - (
            day.revenue / maxRevenue
        ) * chartHeight,

        ordersY: bottom - (
            day.orders / maxOrders
        ) * chartHeight,

        previousRevenueY: bottom - (
            day.previousRevenue / maxRevenue
        ) * chartHeight,

        previousOrdersY: bottom - (
            day.previousOrders / maxOrders
        ) * chartHeight,

        date: day.date
    }));


    // Draw each line
    function drawLine(key, color) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        points.forEach((point, index) => {
            const y = point[key];

            if (index === 0) {
                ctx.moveTo(point.x, y);
            } else {
                ctx.lineTo(point.x, y);
            }
        });

        ctx.stroke();

        // Draw data points
        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point[key], 3, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        });
    }

    
    // Previous period: dashed lines
    ctx.save();
    ctx.setLineDash([6, 5]);

    drawLine("previousRevenueY", "#ffb36b");
    drawLine("previousOrdersY", "#7dd3fc");

    ctx.restore();

    // Current period: solid lines
    ctx.setLineDash([]);

    drawLine("revenueY", "#ff7a18");
    drawLine("ordersY", "#38bdf8");


    // Date labels
    ctx.fillStyle = "#a1a1aa";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    const labelStep = Math.max(
        1,
        Math.ceil(days.length / 6)
    );

    points.forEach((point, index) => {
        if (index % labelStep !== 0 && index !== points.length - 1) {
            return;
        }

        const label = point.date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
        });

        ctx.fillText(label, point.x, bottom + 12);
    });

    
    // ========================================
    // INTERACTIVE CHART TOOLTIP
    // ========================================

    const tooltip = document.getElementById(
        "analyticsChartTooltip"
    );

    if (!tooltip) return;

    canvas.onmousemove = event => {
        const rect = canvas.getBoundingClientRect();

        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Convert canvas coordinates to CSS pixels
        const scaleX = width / rect.width;
        const scaleY = height / rect.height;

        const chartX = mouseX * scaleX;
        const chartY = mouseY * scaleY;

        // Find the closest day's point
        let nearest = null;
        let shortestDistance = Infinity;

        points.forEach((point, index) => {
            const revenueDistance = Math.hypot(
                chartX - point.x,
                chartY - point.revenueY
            );

            const ordersDistance = Math.hypot(
                chartX - point.x,
                chartY - point.ordersY
            );

            
        const distances = [
            Math.hypot(chartX - point.x, chartY - point.revenueY),
            Math.hypot(chartX - point.x, chartY - point.ordersY),
            Math.hypot(chartX - point.x, chartY - point.previousRevenueY),
            Math.hypot(chartX - point.x, chartY - point.previousOrdersY)
        ];

        const distance = Math.min(...distances);

        if (distance < shortestDistance) {
            shortestDistance = distance;

            nearest = {
                point,
                day: days[index]
            };
        }
    });


        if (!nearest || shortestDistance > 22) {
            tooltip.hidden = true;
            return;
        }

        
        const dateLabel = nearest.day.date.toLocaleDateString(
            "en-US",
            {
                weekday: "short",
                month: "short",
                day: "numeric"
            }
        );

        const previousDateLabel =
            nearest.day.previousDate.toLocaleDateString(
                "en-US",
                {
                    month: "short",
                    day: "numeric"
                }
            );

        tooltip.innerHTML = `
            <strong>${dateLabel}</strong>

            <div class="tooltip-revenue">
                Revenue: ${formatUSD(nearest.day.revenue)}
            </div>

            <div class="tooltip-orders">
                Orders: ${nearest.day.orders}
            </div>

            <hr>

            <strong>Previous period</strong>
            <small>${previousDateLabel}</small>

            <div class="tooltip-revenue">
                Revenue: ${formatUSD(nearest.day.previousRevenue)}
            </div>

            <div class="tooltip-orders">
                Orders: ${nearest.day.previousOrders}
            </div>
        `;


        tooltip.hidden = false;

        // Keep the tooltip inside the chart container
        const container = canvas.parentElement;
        const maxLeft = container.clientWidth - 190;
        const maxTop = container.clientHeight - 100;

        tooltip.style.left = `${
            Math.max(8, Math.min(mouseX + 14, maxLeft))
        }px`;

        tooltip.style.top = `${
            Math.max(8, Math.min(mouseY + 14, maxTop))
        }px`;
    };

    canvas.onmouseleave = () => {
        tooltip.hidden = true;
    };

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

        updateAnalyticsStats();
        renderBestSellingProducts();
        renderOrderInsights();
        

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


const analyticsNav =
    document.getElementById("analyticsNav");

const analyticsPeriodFilter =
    document.getElementById("analyticsPeriodFilter");

const settingsNav =
    document.getElementById("settingsNav");

const analyticsPage =
    document.getElementById("analyticsPage");

const settingsPage =
    document.getElementById("settingsPage");



const dashboardSections =
    document.querySelectorAll(
        ".dashboard-welcome, .dashboard.stats-grid, .dashboard-grid, .recent-orders"
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


if (viewAllOrders) {
        viewAllOrders.addEventListener(
            "click",
            () => {
                showPage("orders")
            }
        )
    }



    // ANALYTICS

    if (analyticsPage) {
        analyticsPage.style.display =
            (page === "analytics")
                
                ? "block"
                : "none";

    if (page === "analytics") {
        updateAnalyticsStats();
        renderBestSellingProducts();
        renderAnalyticsChart();
        renderOrderInsights();
    }
    }

    

    

    // SETTINGS

    if (settingsPage) {
        settingsPage.style.display =
            page === "settings"
                ? "block"
                : "none";
    }

    

    // ANALYTICS NAV

    if (analyticsNav) {
        analyticsNav.classList.toggle(
            "active",
            page === "analytics"
        );
    }

    // SETTINGS NAV

    if (settingsNav) {
        settingsNav.classList.toggle(
            "active",
            page === "settings"
        );
    }

}
if (viewAllOrders) {
    viewAllOrders.addEventListener("click", () => {
        showPage("orders");
    });
}
 // ANALYTICS NAV

if (analyticsNav) {
    analyticsNav.addEventListener(
        "click",
        () => {
            showPage("analytics");
        }
    );
}

// SETTINGS NAV

if (settingsNav) {
    settingsNav.addEventListener(
        "click",
        () => {
            showPage("settings");
        }
    );
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



if (analyticsPeriodFilter) {
    analyticsPeriodFilter.addEventListener(
        "change",
        () => {
            updateAnalyticsStats()
            renderAnalyticsChart();
            renderBestSellingProducts();
            renderOrderInsights();
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
    return formatUSD(price);
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

