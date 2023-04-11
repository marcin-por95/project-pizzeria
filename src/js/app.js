import {select, settings} from './settings';
import Product from './components/Product';
import Cart from './components/Cart';


const app = {
  initMenu: function () {
    const thisApp = this;
    // console.log('thisApp.data', thisApp.data);
    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },
  initData: function () {
    const thisApp = this;
    thisApp.data = {};

    const url = settings.db.url + '/' + settings.db.products;
    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
        thisApp.data.products = parsedResponse;
        thisApp.initMenu();
      });
    console.log('dane', thisApp.data, JSON.stringify(thisApp.data));

  },
  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList,addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },
  init: function () {
    const thisApp = this;
    thisApp.initData();
    thisApp.initCart();
  },
};

app.init();
console.log('dupa');
