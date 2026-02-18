import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class FormInputComponent extends Component {
  @tracked value = '';
  @tracked placeholder = 'Enter text...';

  constructor(owner, args) {
    super(owner, args);
    this.placeholder = args.placeholder ?? 'Enter text...';
  }

  get isEmpty() {
    return this.value.length === 0;
  }

  get characterCount() {
    return this.value.length;
  }

  handleInput(event) {
    this.value = event.target.value;
  }

  clear() {
    this.value = '';
  }
}
