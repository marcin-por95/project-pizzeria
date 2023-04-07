import * as settingsJs from '.src/js/settings.js';
import utils from './src/js/utils.js';
import CartProduct from '.src/js/components/CartProduct.js';
class Cart {
  constructor(element) {
    const thisCart = this;
    thisCart.cartData = this.initCardData();
    thisCart.getElements(element);
    // console.log('New Cart', thisCart);
    thisCart.initActions();
  }
  initCardData() {
    return {
      products: [],
      address: '',
      phone: '',
      totalPrice: 0,
      subtotalPrice: 0,
      totalNumber: 0,
      deliveryFee: 0,
    };
  }
  
  getElements(element) {
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    console.log('element karty', element);
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(settingsJs.select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(settingsJs.select.cart.productList);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(settingsJs.select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(settingsJs.select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(settingsJs.select.cart.totalPrice);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(settingsJs.select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(settingsJs.select.cart.address);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(settingsJs.select.cart.totalNumber);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(settingsJs.select.cart.form);
    console.log(thisCart.dom.deliveryFee);
  }
  initActions() {
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle('active');
    });
    thisCart.dom.productList.addEventListener('update', function () {
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function (event) {
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });
    thisCart.dom.form.addEventListener('submit', function (e) {
      e.preventDefault();
      thisCart.submitOrder();
    });
    thisCart.dom.phone.addEventListener('input', function (e) {
      thisCart.cartData.phone = e.target.value;
    });
    thisCart.dom.address.addEventListener('input', function (e) {
      thisCart.cartData.address = e.target.value;
    });
  }
  add(menuProduct) {
    const thisCart = this;

    /* generate HTML based on template */
    const generatedHTML = settingsJs.templates.cartProduct(menuProduct);
    // console.log(generatedHTML);

    /* create DOM element using utils.createElementFromHTML */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);


    /* find menu container */
    const cartContainer = thisCart.dom.productList;
    // console.log(cartContainer);

    /* add DOM element to menu container */
    cartContainer.appendChild(generatedDOM);
    const cartProduct = new CartProduct(menuProduct, generatedDOM);

    thisCart.cartData.products.push(cartProduct.getData());
    //  console.log('thisCart.products', thisCart.products);
    //console.log('thisCart.products', thisCart.products);
    thisCart.update();
  }

  update() {
    const thisCart = this;
    //setting variable
    thisCart.cartData.deliveryFee = settingsJs.settings.cart.defaultDeliveryFee;
    let totalNumber = 0;
    let subtotalPrice = 0;

    //delete delivery fee if cart is empty
    if (thisCart.cartData.products.length === 0) {
      thisCart.cartData.deliveryFee = 0;
    }

    // change variables for every product in basket
    for (let product of thisCart.cartData.products) {
      const amount = product.amount;

      const price = product.price;
      totalNumber += amount;
      subtotalPrice += price;
    }
    //push values of variables to properities of cart & dom.innerHTML
    thisCart.cartData.totalPrice = subtotalPrice + thisCart.cartData.deliveryFee;

    thisCart.dom.deliveryFee.innerHTML = thisCart.cartData.deliveryFee;

    thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
    thisCart.cartData.subtotalPrice = subtotalPrice;
    for (let totalprice of thisCart.dom.totalPrice) {
      totalprice.innerHTML = thisCart.cartData.totalPrice;
    }
    thisCart.dom.totalNumber.innerHTML = totalNumber;
    thisCart.cartData.totalNumber = totalNumber;
    // console.log(thisCart);
  }
  remove(product) {
    const thisCart = this;
    //remove product from HTML
    product.dom.wrapper.remove();
    //delete informations from thisCart.products
    const indexOfProduct = thisCart.cartData.products.indexOf(product);
    thisCart.cartData.products.splice(indexOfProduct, 1);
    //  console.log('after removed',thisCart);
    thisCart.update();

    //update basket


    // console.log('after updating', thisCart);
  }

}
export default Cart;