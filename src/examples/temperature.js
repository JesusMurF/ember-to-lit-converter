import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class TemperatureComponent extends Component {
  @tracked _celsius = 0;

  get celsius() {
    return this._celsius;
  }

  set celsius(value) {
    this._celsius = Number(value);
  }

  get fahrenheit() {
    return this._celsius * 1.8 + 32;
  }

  set fahrenheit(value) {
    this._celsius = (Number(value) - 32) / 1.8;
  }

  get label() {
    return `${this._celsius}°C / ${this.fahrenheit}°F`;
  }
}
