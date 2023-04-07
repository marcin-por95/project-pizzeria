import { settings, select } from '../src/js/settings.js';

class AmountWidget {
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

    const event = new Event('update', {
      bubbles: true
    });
    thisWidget.element.dispatchEvent(event);
  }
}
export default AmountWidget;