// Variables
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.getElementById('clearCartBtn')
const transparentBcg = document.querySelector('.transparentBcg');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

// Cart Item
let cart = [];

// Buttons
let buttonsDOM = [];

// Getting The Products --> First Locally From products.json & Later On From The Current Info
class Products {
    async getProducts() {
        try {
            let result = await fetch('/products.json');
            let data = await result.json();

            let products = data.items;
            products = products.map(item => {
                const { title, price } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                return { title, price, id, image };
            })
            return products;
        } catch (error) {
            console.log(error);
        }
    }
}

/*
 UI For Displaying Products --> Getting All The Items That Is Being Returned From The Products Class & Then Displaying Them
*/
class UI {
    displayProducts(products) {
        let result = "";
        products.forEach(product => {
            result += `
            <!-- Start Of A Single Product -->
            <article class="product">
                <div class="img-container">
                    <img src=${product.image} alt="product" class="product-img">
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>
                        Add To Cart
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article>
            <!-- End Of A Single Product -->
            `;
        });
        productsDOM.innerHTML = result;
    }
    getBagButtons() {
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                button.innerText = "In Cart";
                button.disabled = true;
            }
            button.addEventListener('click', event => {
                event.target.innerText = "In Cart";
                event.target.disabled = true;
                // Get That Specific Product From Products
                let cartItem = { ...Storage.getProduct(id), amount: 1 }; // We Got The Cart Item From The Products
                // Add Prodct To The Cart
                cart = [...cart, cartItem]; // Added That Cart Item To A Cart Array That We Have
                // Save Cart In Local Storage
                Storage.saveCart(cart); // Eventually We're Going To Save That Cart In The Storage
                // Set Cart Values
                this.setCartValues(cart);
                // Display Cart Item
                this.addCartItem(cartItem);
                // Show The Cart
                this.showCart();
            });
        });
    }

    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;

        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });

        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }

    addCartItem(item) {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
        <img src=${item.image} alt="" />
        <div>
            <h4>${item.title}</h4>
            <h5>$${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>Remove</span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>
        `;
        cartContent.appendChild(div);
    }

    showCart() {
        cartOverlay.classList.add("transparentBcg");
        cartDOM.classList.add("showCart");
    }

    setupApp() {
        cart = Storage.getCart(); // Either This Will Be Some Kind Of Values That We Have In The Local Storage If We Have Added Anything OrThis Will Be An Empty Array
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart);
        cartOverlay.addEventListener('click', (e) => {
            if (e.target.classList.contains("transparentBcg")) {
                this.hideCart();
            }
        });
    }

    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item)); // Each And Every Item That Will Be In The Cart Will Be Added To A Cart Number
    }

    hideCart() {
        cartOverlay.classList.remove("transparentBcg");
        cartDOM.classList.remove("showCart");
    }

    cartLogic() {
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        });

        // Create Functionality
        cartContent.addEventListener('click', event => {
            if (event.target.classList.contains("remove-item")) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            } else if (event.target.classList.contains("fa-chevron-up")) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id); // So We Have Cart Array And We're Looking For A Specific Item And Return Me This Specific Item Whose id matches the id That We Just Clicked On
                tempItem.amount += 1;
                this.setCartValues(cart);
                Storage.saveCart(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            } else if (event.target.classList.contains("fa-chevron-down")) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id); // So We Have Cart Array And We're Looking For A Specific Item And Return Me This Specific Item Whose id matches the id That We Just Clicked On
                tempItem.amount -= 1;
                if (tempItem.amount > 0) {
                    this.setCartValues(cart);
                    Storage.saveCart(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                } else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
            }
        });
    }

    clearCart() {
        let cartItems = cart.map(item => item.id); // Create An Array From All The ids We Have In The Cart
        cartItems.forEach(id => this.removeItem(id)) // And Then Loop Over This Array And Then Use Each And Every Item That Is In That Array With A Method Of removeItem
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]); // While There Are Any Children In This Specific Cart Then We Will Gonna Keep Removing It
        }
        this.hideCart();
    }

    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>Add To Cart`;
    }

    getSingleButton(id) { // This Kind Of Method Where We Will Getting The id And Return This Single Button
        return buttonsDOM.find(button => button.dataset.id === id); // Using The Find Method To Return Me That Has The Attribute Of Dataset id equal To The Button We're Passing In
    } // Means Get Me That Specific Button That Was Used To Add That Item Into The Cart
}

// Local Storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }

    static getProduct(id) {
        // This Is Just Gonna Return The Array I Have In My Local Storage
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id)
    }

    static saveCart(cart) { // Gets Thew New Cart Values
        localStorage.setItem('cart', JSON.stringify(cart)); // Saving It In The Local Storage
    }

    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
        // I'm Gonna First Check Whether The Item Exists In The Local Storage Then We'll Gonna Return That Array
        // If That Item Is Not Gonna Exist Then We'll Return This Empty Array
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();
    // Setup Application
    ui.setupApp();
    // Get All Products
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });
});
