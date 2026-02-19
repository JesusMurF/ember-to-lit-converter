import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class UserCardComponent extends Component {
  @tracked firstName = '';
  @tracked lastName = '';
  @tracked email = '';

  constructor(owner, args) {
    super(owner, args);
    this.firstName = args.firstName ?? '';
    this.lastName = args.lastName ?? '';
    this.email = args.email ?? '';
  }

  get fullName() {
    return this.firstName + ' ' + this.lastName;
  }

  get initials() {
    return this.firstName[0] + this.lastName[0];
  }

  get hasEmail() {
    return this.email.length > 0;
  }
}
