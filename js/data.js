// ========================================
// DEFAULT MENU
// ========================================

const defaultPizzas = [
    {
        id: 1,
        name: "Marguerita",
        category: "savory",
        price: 29.90,

        description:
            "Tomato sauce, mozzarella and fresh basil",

        halfAndHalf: true,
        image: "🍕"
    },

    {
        id: 2,
        name: "Pepperoni",
        category: "savory",
        price: 32.90,

        description:
            "Tomato sauce, mozzarela and pepperoni.",

        halfAndHalf: true,
        image: "🍕"
    },

    {
        id: 3,
        name: "Four cheese",
        category: "savory",
        price: 34.90,

        description:
            "A creamy combinations of four delicous cheeses.",

        halfAndHalf: true,
        image: "🍕"
    },

    {
        id: 4,
        name: "Chocolate",
        category: "sweet",
        price: 27.90,

        description:
            "Creamy chocolate topped with colorful sprinkles.",

        halfAndHalf: false,
        image: "🍫"
    }
];


// ========================================
// ADMIN PRODUCTS
// ========================================

const adminProducts =
    JSON.parse(
        localStorage.getItem("kaedesProducts")
    ) || [];


// ========================================
// FINAL MENU
// ========================================

const pizzas =
    adminProducts.length > 0
        ? adminProducts
        : defaultPizzas;