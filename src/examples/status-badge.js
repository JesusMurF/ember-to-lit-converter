import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class StatusBadgeComponent extends Component {
  @tracked status = 'pending';
  @tracked label = '';

  get isActive() {
    return this.status === 'active';
  }
}
