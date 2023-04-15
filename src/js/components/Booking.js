import { select, templates } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import HourPicker from './HourPicker.js';
import DatePicker from './DatePicker.js';

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
    this.hourPicker = new HourPicker(this.dom.hourPicker);
    this.datePicker = new DatePicker(this.dom.datePicker);
  }
  
  render(element) {
    this.dom = {};
    this.dom.wrapper = element;
    this.dom.wrapper.innerHTML = templates.bookingWidget();
    
    this.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    this.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    this.dom.hourPicker = document.querySelector(select.widgets.hourPicker.wrapper);
    this.dom.datePicker = document.querySelector(select.widgets.datePicker.wrapper);
  }
}
