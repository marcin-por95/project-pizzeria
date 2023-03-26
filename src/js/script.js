/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(
        document.querySelector(select.templateOf.menuProduct).innerHTML),
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
      thisProduct.processOrder();
      console.log('new Product:', thisProduct);
    }

    renderInMenu() {
      const thisProduct = this;
      /* [Done] generate html based on template*/
      const generatedHTML = templates.menuProduct(thisProduct.data);
      /* [DONE] create element using utils.createDOMFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /* [DONE] find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu)
      /* [DONE] add element to menu*/
      menuContainer.appendChild(thisProduct.element);
    }

    initAccordion() {
      const thisProduct = this;
      /* START: add event listener to clickable trigger on event click */
      thisProduct.accordionTrigger.addEventListener('click', function (event) {
        /* prevent default action for event */
        event.preventDefault();
        /* find active product (product that has active class) */
        const activeProduct = document.querySelector(
            select.all.menuProductsActive);
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if (activeProduct !== null && activeProduct !== thisProduct.element) {
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(
            classNames.menuProduct.wrapperActive);
      });
    }

    getElements() {
      const thisProduct = this;
      thisProduct.accordionTrigger = thisProduct.element.querySelector(
          select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(
          select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(
          select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(
          select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(
          select.menuProduct.priceElem);
    }

    initOrderForm() {
      const thisProduct = this;
      console.log("initOrderForm()")
      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      })
      for (let currentFormInput of thisProduct.formInputs) {
        currentFormInput.addEventListener('change', function () {
          thisProduct.processOrder();
        })
      }
      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      })

    }

    processOrder() {
      const thisProduct = this;
      // aktualnie zaznaczone opcje w formularzach
      const formData = utils.serializeFormToObject(thisProduct.form);
      // cena poczatkowa
      let price = thisProduct.data.price;
      /*
       iteracja, przejscie po wszystkich parametrach danego produktu
        paramid =  sauce, toppings, crust
      */
      for (let paramId in thisProduct.data.params) {
        // param w tym momencie to jest wartość danego parametru, czyli odpowiadający mu obiekt z nazwą, typem oraz opcjami
        const param = thisProduct.data.params[paramId];
        /*
         iteracja po opcjach danego parametru
         optionId = olives, redPeppers, mushrooms
        */
        for (let optionId in param.options) {
          // option w tym momencie to jest wartość danej opcji,  czyli odpowiadający jej obiekt z ceną, nazwą oraz czy jest opcją domyślną
          const option = param.options[optionId];
          // czy aktualnie sprawdzana opcja parametru jest zaznaczona w formularzu
          if (formData[paramId].includes(optionId)) {
            // wiemu juz, ze jestesmy zaznaczoną opcją, sprawdzamy czy jesteśmy opcją domyślną
            if (option.default !== true) {
              // wiemy już, że nie jesteśmy opcją domyślną, i że jesteśmy opcją zaznaczoną, więc musimy dodać swoją cenę do ceny początkowej produktu
              price += option.price;
            }
            // ukryty "else", gdzie jesteśmy opcją zaznaczoną, ale jesteśmy opcją domyślną więc nie zmieniamy ceny poczatkowej produktu
          }
          // nie jesteśmy zaznaczoną opcja, więc musimy sprawdzić czy byliśmy zazneczni domyślnie (czy jesteśmy opcją domyślną)
          else if (option.default === true) {
            /*
             wiemy, że nie jesteśmy zaznaczoną opcją
             oraz wiemy, że jesteśmy opcją domyślną
             więc powinniśmy odjąć swoją cenę od ceny początkowej
            */
            price -= option.price;
          }
        }
      }
      // cena początkowa została zmieniona w toku pracy algorytymu, więc teraz wystarczy ją podmienić w HTML czyli wyświetlić
      thisProduct.priceElem.innerHTML = price;
    }
  }

  const app = {
    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
    },
    initMenu: function () {
      const thisApp = this;
      console.log('thisApp.data:', thisApp.data);

      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }

    },

    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}