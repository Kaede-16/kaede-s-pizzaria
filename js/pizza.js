// ========================================
// PRODUCT IMAGE
// ========================================

function getPizzaImage(image, name) {

    if (!image) {
        return "🍕";
    }

    // Image URL
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

    // Emoji / text
    return `<span>${image}</span>`;
}


// ========================================
// MENU
// ========================================

function createPizzaCard(pizza) {

    const isSimpleProduct =
        pizza.category === "drinks" ||
        pizza.category === "sides";

    const buttonAction = isSimpleProduct
        ? `addSimpleProductToCart('${pizza.id}')`
        : `openPizzaDetails('${pizza.id}')`;
        

    return `
        <article class="pizza-card">

            <div class="pizza-image">
                ${getPizzaImage(pizza.image, pizza.name)}
            </div>

            <div class="pizza-info">

                <div class="pizza-title">

                    <h3>
                        ${pizza.name}
                    </h3>

                    <span class="pizza-price">
                        R$ ${pizza.price.toFixed(2)}
                    </span>

                </div>

                <p>
                    ${pizza.description}
                </p>

                <button
                    class="add-button"
                    onclick="${buttonAction}"
                >
                    Add +
                </button>

            </div>

        </article>
    `;
}

function renderPizzas(){

    const savoryGrid = document.querySelector(
        "#savory-pizzas .pizza-grid"
    );

    const sweetGrid = document.querySelector(
        "#sweet-pizzas .pizza-grid"
    );

    const savoryPizzas = pizzas.filter(
        pizza => pizza.category === "savory"
    );

    const sweetPizzas = pizzas.filter(
        pizza => pizza.category === "sweet"
    );
    const sides = pizzas.filter(
        product => product.category === "sides"
    );

    const drinks = pizzas.filter(
        product => product.category === "drinks"
    );

    const sidesGrid = document.querySelector(
        "#sides .pizza-grid"
    );

    const drinksGrid = document.querySelector(
        "#drinks .pizza-grid"
    );

    savoryGrid.innerHTML =
       savoryPizzas
          .map(createPizzaCard)
          .join("");

    sweetGrid.innerHTML =
    sweetPizzas
        .map(createPizzaCard)
        .join("");

    if (sidesGrid) {
        sidesGrid.innerHTML = sides.map(createPizzaCard).join("");
    }

    if (drinksGrid) {
        drinksGrid.innerHTML = drinks.map(createPizzaCard).join("");    
    }
}

renderPizzas();


function addSimpleProductToCart(productId) {

    const product = pizzas.find(
        item => String(item.id) === String(productId)
    );

    if (!product) {
        console.error("Product not found:", productId);
        return;
    }

    if (!["drinks", "sides"].includes(product.category)) {
        console.error('This product is not a drink or side.');
        return;
    }

    const unitPrice = product.price;

    const cartItem = {
        id: Date.now() + Math.random(),
        pizzaId: product.id,
        pizza: product.name,
        image: product.image,
        type: product.category === "drinks" ? "Drink" : "Side",
        flavors: [],
        quantity: 1,
        notes: "",
        crust: "",
        unitPrice: unitPrice,
        total: unitPrice
    };

    addToCart(cartItem);

    document.getElementById("cart").scrollIntoView({
        behavior: "smooth"
    });
}




const sideMenu = document.getElementById('sideMenu');

const menuOverlay = document.getElementById('menuOverlay');

const closeMenu = document.getElementById('closeMenu');

const openMenu = document.getElementById('openMenu');


function openSideMenu(){

    sideMenu.classList.add("active");

    menuOverlay.classList.add("active");

}


function closeSideMenu(){

    sideMenu.classList.remove("active");

    menuOverlay.classList.remove("active");

}


openMenu.addEventListener("click", openSideMenu);

closeMenu.addEventListener("click", closeSideMenu);

menuOverlay.addEventListener("click", closeSideMenu);


// PIZZA MODAL

// PIZZA MODAL

let selectedPizza = null;

let selectedFlavors = [];

let quantity = 1;

let choosingSecondFlavor = false;

let selectedCrust = "regular";

const crustOptionsData = [
    {
        id: "regular",
        name: 'Regular Crust',
        description: "Classic pizza crust",
        price: 0,
image: "https://institucional.ifood.com.br/wp-content/uploads/2024/06/sabores-de-pizza-frango-com-catupiry-768x512.jpg"    },
    {
        id: 'cheddar',
        name: 'Cheddar-Stuffed Crust',
        description: "Cheesy and delicious!",
        price: 5,
        image: "https://3.bp.blogspot.com/-dUBosK8SboE/V0hX2vkrP7I/AAAAAAAAAe8/iu4dviprjWoOlpgAjQzVUdsjVcwUSSsSgCLcB/w1200-h630-p-k-no-nu/Borda-Recheada-pizza.jpg"
    },
    {
        id: 'catupiry',
        name: 'Catupiry-Stuffed Crust',
        description: "A creamy Catupiry-filled edge",
        price: 6,
        image: "https://tse4.mm.bing.net/th/id/OIP.Qf7BmiXlWJc8YpDRpODpXQHaE6?r=0&rs=1&pid=ImgDetMain&o=7&rm=3"
    }
]


// MODAL ELEMENTS

const pizzaModal = document.getElementById("pizzaModal");

const closePizzaModal = document.getElementById("closePizzaModal");

const quantityElement = document.getElementById("quantity");

const decreaseQuantity = document.getElementById("decreaseQuantity");

const increaseQuantity = document.getElementById("increaseQuantity");

const modalPrice = document.getElementById("modalPrice");

const addPizza = document.getElementById("addPizza");

const flavorList = document.getElementById("flavorList");

const crustOptions = document.getElementById("crustOptions");

const flavorCount = document.getElementById("flavorCount");

const addAnotherPizza = document.getElementById("addAnotherPizza");

const halfAndHalfQuestion =
    document.getElementById("halfAndHalfQuestion");

const chooseSecondFlavor =
    document.getElementById("chooseAnotherFlavor");

const keepOneFlavor =
    document.getElementById("keepOneFlavor");


function renderCrustOptions() {
    if (!crustOptions) return;

    crustOptions.innerHTML = "";

    crustOptionsData.forEach(crust => {
        const button = document.createElement("button");

        button.type = "button";
        button.classList.add("crust-option");

        button.innerHTML = `
        <img
         class="crust-option-image"
         src="${crust.image}"
         alt="${crust.name}"
         >

        
        <div class="crust-option-info">
            <h4>${crust.name}</h4>  
            <p>${crust.description}</p>
        </div>

        <span class="crust-option-price">
            ${
                crust.price === 0
                   ? "Included"
                   : `+ R$ ${crust.price.toFixed(2)}`
            }
        </span>
        `;

        if (crust.id === selectedCrust) {
            button.classList.add("selected");
        }

        button.addEventListener("click", () => {
            selectedCrust = crust.id;

            document
             .querySelectorAll(".crust-option")
             .forEach(option => {
                option.classList.remove("selected");
             });
             button.classList.add("selected");

             updateModal();
        });
        crustOptions.appendChild(button);
    });

}

    

function showHalfAndHalfQuestion() {
    if (selectedPizza.category === "sweet") {
        const orderItem = createPizzaOrderItem();

        if (!orderItem) {
            return;
        }
        addToCart(orderItem);
        closePizzaDetails();
        document.getElementById("cart").scrollIntoView({
            behavior: "smooth"
        });
        return;
        }
    if (!halfAndHalfQuestion) return;
    halfAndHalfQuestion.style.display = "block";

    addPizza.style.display = "none";
}



function openPizzaDetails(pizzaId) {

    selectedPizza = pizzas.find(
        pizza => String(pizza.id) === String(pizzaId)
    );

    if (!selectedPizza) {
        console.error("Pizza not found:", pizzaId);
        return;
    }

    quantity = 1;

    selectedFlavors = [selectedPizza];

    choosingSecondFlavor = false;

    selectedCrust = "regular";

    if (addAnotherPizza) {
        addAnotherPizza.style.display = "none";
    }

    const primaryFlavor =
    document.getElementById("primaryFlavor");

   const primaryFlavorName =
    document.getElementById("primaryFlavorName");

   if (primaryFlavor) {
    primaryFlavor.style.display = "none";
}

  if (primaryFlavorName) {
    primaryFlavorName.textContent =
        selectedPizza.name;
}

    const flavorsSection = document.querySelector(".flavors-section");
    if (flavorsSection) {
        flavorsSection.classList.remove("active");
    }

    halfAndHalfQuestion.style.display = "none";
    addPizza.style.display = "block";
    flavorList.style.display = "none";


    document.getElementById("modalPizzaName").textContent =
        selectedPizza.name;

    document.getElementById("modalDescription").textContent =
        selectedPizza.description;

    const modalImage =
        document.getElementById("modalPizzaImage");

    modalImage.innerHTML =
        getPizzaImage(
            selectedPizza.image,
            selectedPizza.name
        );

renderFlavorOptions();

updateFlavorCount();

renderCrustOptions();

updateModal();

    pizzaModal.classList.add("active");
}

// RENDER FLAVORS

function renderFlavorOptions() {

    flavorList.innerHTML = "";

    const savoryPizzas = pizzas.filter(
        pizza => pizza.category === "savory"
    );


    // =========================================
    // NORMAL MODE
    // =========================================

if (!choosingSecondFlavor) {

    // Voltar para o estado normal
    const primaryFlavor =
        document.getElementById("primaryFlavor");

    const flavorTitle =
        document.getElementById("flavorTitle");

    const flavorHelp =
        document.getElementById("flavorHelp");

    if (primaryFlavor) {
        primaryFlavor.style.display = "none";
    }

    if (flavorTitle) {
        flavorTitle.textContent = "Choose a flavor";
    }

    if (flavorHelp) {
        flavorHelp.textContent =
            "Choose one flavor for your pizza.";
    }

    // Criar sabores normalmente
    savoryPizzas.forEach(pizza => {
        createFlavorOption(pizza);
    });

    return;
}


    // =========================================
    // HALF & HALF MODE
    // =========================================

    const primaryFlavor =
        document.getElementById("primaryFlavor");

    const primaryFlavorName =
        document.getElementById("primaryFlavorName");


    // Mostrar sabor original no topo

    if (primaryFlavor) {
        primaryFlavor.style.display = "flex";
    }

    if (primaryFlavorName) {
        primaryFlavorName.textContent =
            selectedFlavors[0].name;
    }


    // Mudar título

    const flavorTitle =
        document.getElementById("flavorTitle");

    const flavorHelp =
        document.getElementById("flavorHelp");

    if (flavorTitle) {
        flavorTitle.textContent =
            "Choose the second flavor?";
    }

    if (flavorHelp) {
        flavorHelp.textContent =
            "Choose a flavor for the second half.";
    }


    // Mostrar somente os OUTROS sabores

    savoryPizzas
        .filter(
            pizza =>
                pizza.id !== selectedFlavors[0].id
        )
        .forEach(pizza => {

            createFlavorOption(pizza);

        });

}

function createFlavorOption(pizza) {

    const flavorOption =
        document.createElement("button");

    flavorOption.type = "button";

    flavorOption.classList.add(
        "flavor-option"
    );


    flavorOption.innerHTML = `

        <div class="flavor-option-image">

            ${getPizzaImage(
                pizza.image,
                pizza.name
            )}

        </div>

        <div class="flavor-info">

            <h4>${pizza.name}</h4>

            <p>${pizza.description}</p>

        </div>

        <div class="flavor-check">
            ✓
        </div>

    `;


    if (
        selectedFlavors.some(
            flavor => flavor.id === pizza.id
        )
    ) {

        flavorOption.classList.add(
            "selected"
        );

    }


    flavorOption.addEventListener(
        "click",
        () => {

            selectFlavor(
                pizza,
                flavorOption
            );

        }
    );


    flavorList.appendChild(
        flavorOption
    );

}

// SELECT FLAVOR

function selectFlavor(pizza, element) {

    // When choosing the second flavor,
    // the first flavor cannot be removed.
    if (choosingSecondFlavor) {

        // Don't allow the first flavor to be selected again
        if (selectedFlavors[0].id === pizza.id) {
            return;
        }

        // Maximum of 2 flavors
        if (selectedFlavors.length >= 2) {
            return;
        }

        selectedFlavors.push(pizza);
        element.classList.add("selected");

        updateFlavorCount();
        updateModal();

        // Second flavor selected
        if (selectedFlavors.length === 2) {
            finishHalfAndHalf();
        }

        return;
    }

    const alreadySelected = selectedFlavors.some(
        flavor => flavor.id === pizza.id
    );

    // Remove if already selected
    if (alreadySelected) {
        selectedFlavors = selectedFlavors.filter(
            flavor => flavor.id !== pizza.id
        );

        element.classList.remove("selected");

        updateFlavorCount();
        updateModal();

        return;
    }

    // Maximum of 2 flavors
    if (selectedFlavors.length >= 2) {
        return;
    }

    // Add flavor
    selectedFlavors.push(pizza);
    element.classList.add("selected");

    updateFlavorCount();
    updateModal();
}

function finishHalfAndHalf() {

    if (selectedFlavors.length !== 2) {
        return;
    }

    const orderItem = createPizzaOrderItem();

    if (!orderItem) {
        return;
    }

    addToCart(orderItem);

    // Reset
    selectedPizza = null;
    selectedFlavors = [];
    quantity = 1;
    choosingSecondFlavor = false;

    const notes = document.getElementById("pizzaNotes");

    if (notes) {
        notes.value = "";
    }

    // Hide the question
    halfAndHalfQuestion.style.display = "none";

    // Show the Add to Cart button again
    addPizza.style.display = "block";

    closePizzaDetails();

    document
        .getElementById("cart")
        .scrollIntoView({
            behavior: "smooth"
        });
}

function updateFlavorCount() {

    flavorCount.textContent =
        `${selectedFlavors.length}/2`;

    if (addAnotherPizza) {
        if (selectedFlavors.length === 2) {
            addAnotherPizza.style.display = "block";
        } else {
            addAnotherPizza.style.display = "none";
        }
    }

}



function getSelectedCrustOption() {
    return crustOptionsData.find(
        crust => crust.id === selectedCrust
    ) || crustOptionsData[0];
}

function updateModal() {
    quantityElement.textContent = quantity;

    if (!selectedPizza) {
        return;
    }

    const crust = getSelectedCrustOption();

    const unitPrice = selectedPizza.price + crust.price;
    const total = unitPrice * quantity;

    modalPrice.textContent =
        `R$ ${total.toFixed(2)}`;
}


increaseQuantity.addEventListener(
    "click",
    () => {

        quantity++;

        updateModal();

    }
);


decreaseQuantity.addEventListener(
    "click",
    () => {

        if (quantity > 1) {

            quantity--;

            updateModal();

        }

    }
);


function closePizzaDetails() {

    pizzaModal.classList.remove("active");

}


if (closePizzaModal) {

    closePizzaModal.addEventListener(
        "click",
        closePizzaDetails
    );

}


pizzaModal.addEventListener(
    "click",
    event => {

        if (event.target === pizzaModal) {

            closePizzaDetails();

        }

    }
);

function createPizzaOrderItem() {

    if (!selectedPizza) {
        return null;
    }

    if (selectedFlavors.length === 0) {
        alert("Please choose at least one flavor.");
        return null;
    }

    const notes =
        document.getElementById("pizzaNotes").value;

    const type =
        selectedFlavors.length === 1
            ? "Whole Pizza"
            : "Half & Half";

    const orderItem = {

        id: Date.now() + Math.random(),

        pizzaId: selectedPizza.id,

        pizza: selectedPizza.name,

        image: selectedPizza.image,

        type: type,

        flavors: selectedFlavors.map(
            flavor => flavor.name
        ),

        quantity: quantity,

        notes: notes,


       crust: getSelectedCrustOption().name,

       unitPrice:
         selectedPizza.price + getSelectedCrustOption().price,

       total:
        (
         selectedPizza.price +
         getSelectedCrustOption().price
        ) * quantity
    };

    return orderItem;
}

addPizza.addEventListener(
    "click",
    () => {
        showHalfAndHalfQuestion();
    }
);

keepOneFlavor.addEventListener(
    "click",
    () => {
        const orderItem = createPizzaOrderItem();

        if (!orderItem) return;
        addToCart(orderItem);

        closePizzaDetails();
        document
             .getElementById("cart")
                .scrollIntoView({
                    behavior: "smooth"
                });
    }
);

chooseSecondFlavor.addEventListener(
    "click",
    () => {

        const firstFlavor =
            selectedFlavors[0];

        choosingSecondFlavor = true;

        selectedFlavors = [firstFlavor];

        halfAndHalfQuestion.style.display = "none";

        flavorList.style.display = "flex";

        renderFlavorOptions();

        if (addAnotherPizza) {
            addAnotherPizza.style.display = "block";
        }

    }
);


if (addAnotherPizza) {

    addAnotherPizza.addEventListener(
        "click",
        () => {

            // Cancelar a pizza atual
            selectedPizza = null;
            selectedFlavors = [];
            quantity = 1;

            choosingSecondFlavor = false;

            // Limpar observações
            const notes =
                document.getElementById("pizzaNotes");

            if (notes) {
                notes.value = "";
            }

            // Esconder o botão novamente
            addAnotherPizza.style.display = "none";

            // Fechar pergunta Half & Half
            halfAndHalfQuestion.style.display = "none";

            // Voltar ao estado normal
            addPizza.style.display = "block";

            // Fechar modal
            closePizzaDetails();

            // Voltar ao menu
            document
                .getElementById("savory-pizzas")
                .scrollIntoView({
                    behavior: "smooth"
                });

        }
    );

}

// OPENING HOURS

const openinHours = {

    sunday: {

        open: "5:55pm",

        close: "11:15pm"

    },

    monday: {

        open: "5:55pm",

        close: "11:15pm"

    },

    tuesday: {

        open: "5:55pm",

        close: "11:15pm"

    },

    wednesday: {

        open: "5:55pm",

        close: "11:15pm"

    },

    thursday: {

        open: "5:55pm",

        close: "11:15pm"

    },

    friday: {

        open: "5:55pm",

        close: "11:15pm"

    },

    saturday: {

        open: "5:55pm",

        close: "11:15pm"

    }

};