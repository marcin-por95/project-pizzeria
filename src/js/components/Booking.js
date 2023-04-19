import { classNames, select, settings, templates } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import HourPicker from './HourPicker.js';
import DatePicker from './DatePicker.js';
import utils from '../utils.js';


export default class Booking {
  constructor(element) {

    this.render(element);
    this.initWidgets();
    this.addEventListeners();
    this.getData();

  }

  getData() {
    const thisBooking = this;
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(this.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(this.datePicker.maxDate);

    const params = {
      booking: [startDateParam, endDateParam],
      eventsCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],
      eventsRepeat: [settings.db.repeatParam, endDateParam]
    };

    const urls = {
      bookings: settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat.join('&'),
    };

    Promise.all([fetch(urls.bookings), fetch(urls.eventsCurrent), fetch(urls.eventsRepeat),])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];

        return Promise.all([bookingsResponse.json(), eventsCurrentResponse.json(), eventsRepeatResponse.json(),]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    this.booked = {};
    for (let item of eventsCurrent) {
      this.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for (let item of bookings) {
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
    this.updateDom();
  }

  makeBooked(date, hour, duration, table) {
    if (typeof this.booked[date] === 'undefined') {
      this.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      if (typeof this.booked[date][hourBlock] === 'undefined') {
        this.booked[date][hourBlock] = [];
      }
      this.booked[date][hourBlock].push(table);
    }
  }

  updateDom() {

    this.date = this.datePicker.value;
    this.hour = utils.hourToNumber(this.hourPicker.value);


    this.selectedTables = [];
    const tables = this.dom.wrapper.querySelectorAll(select.booking.tables);
    for (let table of tables) {
      table.classList.remove(classNames.booking.tableSelected);
    }


    const bookTime = this.booked[this.date][this.hour];
    let allAvailable = false;
    if (typeof this.booked[this.date] == 'undefined' || typeof bookTime == 'undefined') {
      allAvailable = true;
    }
    for (const table of this.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }
      if (!allAvailable && bookTime.includes(tableId) > false) {
        table.classList.add(classNames.booking.tableBooked);
      }
      else {
        table.classList.remove(classNames.booking.tableBooked);
      }

    }

  }

  initWidgets() {
    this.peopleAmount = new AmountWidget(this.dom.peopleAmount);
    this.hoursAmount = new AmountWidget(this.dom.hoursAmount);
    this.hourPicker = new HourPicker(this.dom.hourPicker);
    this.datePicker = new DatePicker(this.dom.datePicker);
  }

  addEventListeners() {
    const thisBooking = this;
    this.dom.wrapper.addEventListener('update', () => {
      this.updateDom();
    });
    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDom();
    });
    thisBooking.dom.floorPlan.addEventListener('click', function (event) {
      thisBooking.initTables(event);
    });
    thisBooking.dom.submitButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }

  initTables(event) {
    const thisBooking = this;
    const clickedElement = event.target;

    if (clickedElement.classList.contains(classNames.booking.table)) {

      const tableId = clickedElement.getAttribute(settings.booking.tableIdAttribute);

      if (thisBooking.selectedTables !== 0 && clickedElement.classList.contains(classNames.booking.tableSelected)) {

        clickedElement.classList.remove(classNames.booking.tableBooked);
        thisBooking.selectedTables = 0;
      }
      else if (clickedElement.classList.contains(classNames.booking.tableBooked)) {
        alert('This table is unavailable');
      }
      else {
        for (let table of thisBooking.dom.tables) {
          if (table.classList.contains(classNames.booking.tableSelected)) {

            table.classList.remove(classNames.booking.tableSelected);
          }
        }
        clickedElement.classList.add(classNames.booking.tableSelected);
        thisBooking.selectedTables = tableId;
      }
    }
  }

  sendBooking() {

    const formObject = {
      date: this.date, // data wybrana w datePickerze
      hour: utils.numberToHour(this.hour), // godzina wybrana w hourPickerze (w formacie HH:ss)
      table: this.selectedTables.length === 0 ? null : this.selectedTables, //numer wybranego stolika (lub null jeśli nic nie wybrano)
      duration: this.hoursAmount.value, //liczba godzin wybrana przez klienta
      ppl: this.peopleAmount.value, //liczba osób wybrana przez klienta
      starters: [
        ...(this.dom.water.checked ? ['water'] : []),
        ...(this.dom.bread.checked ? ['bread'] : []), //https://2ality.com/2017/04/conditional-literal-entries.html
      ],
      phone: this.dom.phone.value, // numer telefonu z formularza,
      address: this.dom.address.value //adres z formularza
    };
    console.log(formObject);
    const url = `${ settings.db.url }/${ settings.db.booking }`;
    fetch(url, {
      method: 'POST', body: JSON.stringify(formObject), headers: {
        'Content-Type': 'application/json',
      },
    }).then(r => r.json())
      .then(() => {
        this.makeBooked(formObject.date, formObject.hour, formObject.duration, formObject.table);
      })
      .catch((e) => {
        console.error(e);
      });

  }


  render(element) {
    this.dom = {};
    this.dom.wrapper = element;
    this.dom.wrapper.innerHTML = templates.bookingWidget();
    this.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    this.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    this.dom.hourPicker = document.querySelector(select.widgets.hourPicker.wrapper);
    this.dom.datePicker = document.querySelector(select.widgets.datePicker.wrapper);
    this.dom.tables = document.querySelectorAll(select.booking.tables);
    this.dom.submitButton = document.querySelector(select.booking.submitButton);
    this.dom.phone = document.querySelector(select.booking.phone);
    this.dom.address = document.querySelector(select.booking.address);
    this.dom.water = document.querySelector(select.booking.water);
    this.dom.bread = document.querySelector(select.booking.bread);

    this.dom.floorPlan = this.dom.wrapper.querySelector(select.booking.floorPlan);
  }
}