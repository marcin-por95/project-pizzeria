import {settings, select, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
import Home from './components/Home.js';


const app = {

  initMenu: function () {
    const thisApp = this;
    // console.log('thisApp.data:', thisApp.data);
    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },
  initData: function () {
    const thisApp = this;
    const url = settings.db.url + '/' + settings.db.products;
    thisApp.data = {};
    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;
        /* execute initMenu method */
        thisApp.initMenu();
      });
    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },
  initCart: function () {
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);
    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function (event) {
      app.cart.add(event.detail.product);
    });
  },
  init: function () {
    const thisApp = this;

    thisApp.initData();
    thisApp.initCart();
    thisApp.initPages();
    thisApp.initBooking();
    thisApp.initHome();


  },

  initPages: function () {
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id;

    for (let page of thisApp.pages) {
      if (page.id === idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash); //thisApp.pages[0].id => idFromHash => pageMatchingHash

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function (event) {
        const clickedElement = this;
        event.preventDefault();

        //get page id from href attribute
        const id = clickedElement.getAttribute('href').replace('#', '');

        //run thisApp.activatePage with that id

        thisApp.activatePage(id);

        // change URL hash

        window.location.hash = '#/' + id;

      });
    }
  },

  activatePage: function (pageId) {

    const thisApp = this;

    //add class "active" to matching pages, remove from non-matching
    for (let page of thisApp.pages) {

      page.classList.toggle(classNames.pages.active, page.id === pageId);
    }
    //add class "active" to matching links, remove from non=matching
    for (let link of thisApp.navLinks) {

      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') === '#' + pageId);
    }

  },

  initBooking: function () {
    const thisApp = this;

    const widgetContainer = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(widgetContainer);
  },

  initHome: function(){

    const homeContainer = document.querySelector(select.containerOf.home);
    this.home = new Home(homeContainer);

    // Select all links at home section using querySelectorAll
    this.links = document.querySelectorAll(select.home.links);

    for(let link of this.links){
      // Find the closest ancestor element with .link class
      const linkContainer = link.closest('.link');

      if (linkContainer) {
        linkContainer.addEventListener('click', function(event){
          event.preventDefault();

          const href = link.getAttribute('href');
          if (href.startsWith('#')) {
            // Create const to extract a part of string (1 mean first string for example booking)
            const id = href.substring(1);
            this.activatePage(id);
            window.location.hash = '#/' + id;
          } else {
            window.location.href = href;
          }
        });
      }
    }
  },

};

app.init();
