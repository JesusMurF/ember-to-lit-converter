import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CounterComponent extends Component {
  @tracked count = 0;
  @tracked step = 1;

  get isAtMin() {
    return this.count <= 0;
  }

  get displayValue() {
    return `Count: ${this.count}`;
  }

  @action
  increment() {
    this.count += this.step;
  }

  @action
  decrement() {
    if (!this.isAtMin) {
      this.count -= this.step;
    }
  }

  @action
  reset() {
    this.count = 0;
  }

  @action
  updateStep(event) {
    this.step = Number(event.target.value);
  }
}
