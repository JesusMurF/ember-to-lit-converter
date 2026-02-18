import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class SimpleListComponent extends Component {
  @tracked items = '';
  @tracked selectedIndex = -1;

  get count() {
    return this.items.length;
  }

  get hasSelection() {
    return this.selectedIndex >= 0;
  }

  addItem(item) {
    this.items = this.items + item;
  }

  removeItem(index) {
    this.selectedIndex = -1;
    this.items = this.items.slice(0, index) + this.items.slice(index + 1);
  }

  selectItem(index) {
    this.selectedIndex = index;
  }

  clearSelection() {
    this.selectedIndex = -1;
  }
}
