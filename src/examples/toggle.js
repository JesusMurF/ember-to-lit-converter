import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class ToggleComponent extends Component {
  @tracked isActive = false;

  get label() {
    return this.isActive ? 'On' : 'Off';
  }

  get statusClass() {
    return this.isActive ? 'toggle--active' : 'toggle--inactive';
  }

  toggle() {
    this.isActive = !this.isActive;
  }
}
