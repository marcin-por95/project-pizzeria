import {select, templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';

export default class Booking {


  constructor(element) {
    this.render(element);
    this.initWidgets();
  }

  initWidgets() {


    this.peopleAmountWidget = new AmountWidget(this.dom.peopleAmount);
    this.hoursAmountWidget = new AmountWidget(this.dom.hoursAmount);

    this.dom.hoursAmount.addEventListener('update', () => {
    });
    this.dom.peopleAmount.addEventListener('update', () => {
    });


  }

  render(element) {
    this.dom = {};
    this.dom.wrapper = element;

    this.dom.wrapper.innerHTML = templates.bookingWidget();
    this.dom.peopleAmount = select.booking.peopleAmount;
    this.dom.hoursAmount = select.booking.hoursAmount;


  }
}

