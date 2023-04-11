/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };



  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
    }
    renderInMenu() {
      const thisProduct = this;
      /* generate HTML based on template */
      const generateHTML = templates.menuProduct(thisProduct.data);

      /* create DOM element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generateHTML);
      // console.log(thisProduct.element);

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add DOM element to menu container */
      menuContainer.appendChild(thisProduct.element);
    }
    getElements() {
      const thisProduct = this;

      thisProduct.dom = {};
      // console.log(thisProduct.dom);
      thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
      // console.log(thisProduct.dom.form);
      thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
    }
    initAccordion() {
      const thisProduct = this;

      /* START: add event listener to clickable trigger on event click */
      thisProduct.dom.accordionTrigger.addEventListener('click', function (event) {
        /* prevent default action for event */
        event.preventDefault();

        /* find active products (products that has active class) */
        const activeProducts = document.querySelectorAll(select.all.menuProductsActive);

        const clickedMenuProduct = thisProduct.element;
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if (clickedMenuProduct.classList.contains('active') == false) {
          for (let activeProduct of activeProducts) {
            activeProduct.classList.remove('active');
          }
          /* toggle active class on thisProduct.element */
          clickedMenuProduct.classList.toggle('active');
        } else {
          /* toggle active class on thisProduct.element */
          clickedMenuProduct.classList.toggle('active');
        }
      });
    }
    initOrderForm() {
      const thisProduct = this;
      // console.log(thisProduct);

      thisProduct.dom.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.dom.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }

      thisProduct.dom.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCardt();
        thisProduct.prepareCartProductParams();
      });
    }
    processOrder() {
      const thisProduct = this;

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      // console.log('formData', formData);

      // set price to default price
      let price = thisProduct.data.price;



      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        // console.log('params',paramId, param);

        // for every option in this category
        for (let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];

          //add option price to product if option is checked & substracts it when it isn't
          if (formData[paramId].includes(optionId) && option.default) {
            price = price + option['price'];
          }
          else if (formData[paramId].includes(optionId) == false && !option.default) {
            price = price - option['price'];
          }


          // add img to product if option is checked & remove if it isn't
          const img = thisProduct.dom.imageWrapper.querySelector('.' + paramId + '-' + optionId);

          if (formData[paramId].includes(optionId) && img) {
            img.classList.add(classNames.menuProduct.imageVisible);
          }
          else if (formData[paramId].includes(optionId) == false && img) {
            img.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
      thisProduct.priceSingle = price;

      /*multiply price by amount*/
      price *= thisProduct.amountWidget.value;

      // update calculated price in the HTML
      thisProduct.dom.priceElem.innerHTML = price;
    }
    initAmountWidget() {
      const thisProduct = this;

      thisProduct.amountWidget = new AmoundWidget(thisProduct.dom.amountWidgetElem);

      thisProduct.dom.amountWidgetElem.addEventListener('update', function () { thisProduct.processOrder(); });
    }
    prepareCartProduct() {
      const thisProduct = this;

      const productSummury = {};
      productSummury.id = thisProduct.data.id;
      //console.log(thisProduct);
      productSummury.name = thisProduct.data.name;
      productSummury.amount = parseInt(thisProduct.amountWidget.value);
      productSummury.priceSingle = parseInt(thisProduct.priceSingle);
      productSummury.price = productSummury.amount * productSummury.priceSingle;
      productSummury.params = thisProduct.prepareCartProductParams();

    //  console.log('productSummary', productSummury);

      return productSummury;
    }
    prepareCartProductParams() {
      const thisProduct = this;

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      console.log('formData in cartProductParams', formData);

      // create empty opbjects for params and params.options
      const params = {};

      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }

        const param = thisProduct.data.params[paramId];
        params[paramId] = {
          label: {},
          options: {},
        };

        // for every option in this category
        for (let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          params[paramId].label = paramId;

          //create object for every checked option
          if (formData[paramId].includes(optionId)) {
            const key = optionId;
            const value = option.label;
            const object = new Object({ [key]: value });
            Object.assign(params[paramId].options, object);
          }
        }

       // console.log(params);

      }
      return params;
    }
    addToCardt() {
      const thisProduct = this;

      app.cart.add(thisProduct.prepareCartProduct());

    }

  }

  class AmoundWidget {
    constructor(element) {
      const thisWidget = this;

      // console.log('AmountWidget', thisWidget);
      // console.log('constructor arguments', element);
      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();
      // console.log(thisWidget.element.querySelector(select.widgets.amount.input));
    }
    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.value = settings.amountWidget.defaultValue;
      // console.log(thisWidget.element);
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }
    setValue(value) {
      const thisWidget = this;

      const newValue = parseInt(value);

      /*TODO Add validation */

      thisWidget.value !== newValue && !isNaN(newValue) &&
        newValue >= settings.amountWidget.defaultMin &&
        newValue <= settings.amountWidget.defaultMax ? thisWidget.value = newValue : false;
      thisWidget.input.value = thisWidget.value;
      thisWidget.announce();

    }
    initActions() {
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function () {
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(--thisWidget.input.value);
      });
      thisWidget.linkIncrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(++thisWidget.input.value);
      });
      
    }
    announce() {
      const thisWidget = this;

      const event = new Event('update',{
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart {
    constructor(element) {
      const thisCart = this;

      thisCart.products = [];
      thisCart.getElements(element);
     // console.log('New Cart', thisCart);
      thisCart.initActions();
    }
    getElements(element){
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      console.log('element karty',element);
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

      thisCart.dom.toggleTrigger.addEventListener('click', function(event){
        event.preventDefault();
        thisCart.dom.wrapper.classList.toggle('active');
      });
      thisCart.dom.productList.addEventListener('update', function(){
        thisCart.update();
      });
      thisCart.dom.productList.addEventListener('remove', function(event){
        thisCart.remove(event.detail.cartProduct);
      });
      thisCart.dom.productList.addEventListener('updated', function(){
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

    update(){
      const thisCart = this;
      //setting variable
      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
       let totalNumber = 0;
       let subtotalPrice = 0;

       //delete delivery fee if cart is empty
       if (thisCart.products.length === 0){
         thisCart.deliveryFee = 0;
       }

       // change variables for every product in basket
       for (let product of thisCart.products){
         const amount = product.amount;

        const price = product.price;
        totalNumber += amount;
        subtotalPrice += price;
      }
      //push values of variables to properities of cart & dom.innerHTML
      thisCart.totalPrice = subtotalPrice + thisCart.deliveryFee;
      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
      for (let totalprice of thisCart.dom.totalPrice){
        totalprice.innerHTML = thisCart.totalPrice;
      }
      thisCart.dom.totalNumber.innerHTML = totalNumber;
     // console.log(thisCart);
    }
    remove(product){
      const thisCart = this;
      //remove product from HTML
      product.dom.wrapper.remove();
       //delete informations from thisCart.products
       const indexOfProduct = thisCart.products.indexOf(product);
       thisCart.products.splice(indexOfProduct,1);
     //  console.log('after removed',thisCart);
       thisCart.update();

       //update basket

      
      // console.log('after updating', thisCart);
    }
  }

  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.params = menuProduct.params;
      Object.assign(thisCartProduct.params, menuProduct.params);
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      
    
     // console.log('thisCardProduct', thisCartProduct);

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget(element);
      thisCartProduct.initActions();
    }
    getElements(element) {
      const thisCartProduct = this;

      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
      thisCartProduct.dom.amountWidgetElem = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);

      //console.log('CartProduct', thisCartProduct.dom);
    }
    initAmountWidget() {
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmoundWidget(thisCartProduct.dom.amountWidgetElem);

      thisCartProduct.dom.amountWidgetElem.addEventListener('update', function () {
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }
    remove(){
      const thisCardProduct = this;

      const event = new CustomEvent('remove',{
        bubbles: true,
        detail: {
          cartProduct: thisCardProduct,
        },
      });
      thisCardProduct.dom.wrapper.dispatchEvent(event);
    }
    initActions(){
      const thisCardProduct = this;

      thisCardProduct.dom.edit.addEventListener('click', function(event){
        event.preventDefault();
      });
      

      thisCardProduct.dom.remove .addEventListener('click', function(event){
        event.preventDefault();
        thisCardProduct.remove();
      });
    }

  }




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
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedResponse){
          console.log('parsedResponse', parsedResponse);
          thisApp.data.products = parsedResponse;
          thisApp.initMenu();
        });
      console.log('dane',thisApp.data, JSON.stringify(thisApp.data));

    },
    initCart: function () {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();
      
      thisApp.initCart();
    },
  };

  app.init();
}