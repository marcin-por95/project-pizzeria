
import CartProduct from './CartProduct';

import utils from '../utils';

import {select, settings, templates} from './settings';


export default class Cart {
  constructor(element) {
    const thisCart = this;
  
    thisCart.products = [];
    thisCart.getElements(element);
    // console.log('New Cart', thisCart);
    thisCart.initActions();
  }
  getElements(element) {
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    console.log('element karty', element);
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
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
  }
  add(menuProduct) {
    const thisCart = this;
  
    /* generate HTML based on template */
    const generatedHTML = templates.cartProduct(menuProduct);
    // console.log(generatedHTML);
  
    /* create DOM element using utils.createElementFromHTML */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
  
  
    /* find menu container */
    const cartContainer = thisCart.dom.productList;
    // console.log(cartContainer);
  
    /* add DOM element to menu container */
    cartContainer.appendChild(generatedDOM);
  
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    //  console.log('thisCart.products', thisCart.products);
    //console.log('thisCart.products', thisCart.products);
    thisCart.update();
  }
  
  update() {
    const thisCart = this;
    //setting variable
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    let totalNumber = 0;
    let subtotalPrice = 0;
  
    //delete delivery fee if cart is empty
    if (thisCart.products.length === 0) {
      thisCart.deliveryFee = 0;
    }
  
    // change variables for every product in basket
    for (let product of thisCart.products) {
      const amount = product.amount;
  
      const price = product.price;
      totalNumber += amount;
      subtotalPrice += price;
    }
    //push values of variables to properities of cart & dom.innerHTML
    thisCart.totalPrice = subtotalPrice + thisCart.deliveryFee;
    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
    for (let totalprice of thisCart.dom.totalPrice) {
      totalprice.innerHTML = thisCart.totalPrice;
    }
    thisCart.dom.totalNumber.innerHTML = totalNumber;
    // console.log(thisCart);
  }
  remove(product) {
    const thisCart = this;
    //remove product from HTML
    product.dom.wrapper.remove();
    //delete informations from thisCart.products
    const indexOfProduct = thisCart.products.indexOf(product);
    thisCart.products.splice(indexOfProduct, 1);
    //  console.log('after removed',thisCart);
    thisCart.update();
  
    //update basket
  
  
    // console.log('after updating', thisCart);
  }
}