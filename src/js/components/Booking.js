import {select, settings, templates, classNames} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import HourPicker from './HourPicker.js';
import DatePicker from './DatePicker.js';
import utils from '../utils.js';

export default class Booking {
  constructor(element) {
    this.render(element);
    this.initWidgets();
    this.getData();

    this.parseData = this.parseData.bind(this);
    this.getData = this.getData.bind(this);
  }

  getData() {
    const startDateParam = `${settings.db.dateStartParamKey}=${utils.dateToStr(this.datePicker.minDate)}`;
    const endDateParam = `${settings.db.dateEndParamKey}=${utils.dateToStr(this.datePicker.maxDate)}`;


    const params = {
      booking: [
        startDateParam,
        endDateParam,

      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,

      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,

      ],
    };
    // console.log('getData', params);

    const urls = {
      bookings: settings.db.url + '/' + settings.db.booking
        + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event
        + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event
        + '?' + params.eventsRepeat.join('&'),
    };

    //console.log('getData url',urls);
    Promise.all([
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];

        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })

      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        this.parseData(bookings, eventsCurrent, eventsRepeat);
      }.bind(this));


  }

  parseData(bookings, eventsCurrent, eventsRepeat) {

    this.booked = {};

    for (let item of bookings) {
      this.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      this.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = this.datePicker.minDate;
    const maxDate = this.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat === 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          this.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    console.log('this.booked', this.booked);
  }

  makeBooked(date, hour, duration, table) {


    if (typeof this.booked[date] === 'undefined') {
      this.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
     // console.log('loop', hourBlock);
      if (typeof this.booked[date][hourBlock] === 'undefined') {
        this.booked[date][hourBlock] = [];
      }

      this.booked[date][hourBlock].push(table);
    }
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

  initWidgets() {
    this.hourPicker = new HourPicker(this.dom.hourPicker);
    this.datePicker = new DatePicker(this.dom.datePicker);
    this.peopleAmountWidget = new AmountWidget(this.dom.peopleAmount);
    this.hoursAmountWidget = new AmountWidget(this.dom.hoursAmount);
    this.dom.hoursAmount.addEventListener('update', () => {
    });
    this.dom.peopleAmount.addEventListener('update', () => {
    });



  }

}
