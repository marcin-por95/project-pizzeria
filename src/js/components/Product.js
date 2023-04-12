
import { select, classNames, templates } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';


export default class Product {
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
      thisProduct.addtoCart();
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

    thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);

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
  addtoCart() {
    const thisProduct = this;

    const event = new CustomEvent('add-to-cart', {
      bubbles: true, 
      detail: {
        product: thisProduct
      }
    });

    // app.cart.add(thisProduct.prepareCartProduct());

    thisProduct.element.dispatchEvent(event);

  }

}