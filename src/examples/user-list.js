import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class UserListComponent extends Component {
  @service store;
  @service router;
  @service('notification-manager') notifications;

  @tracked users = [];
  @tracked isLoading = false;

  get hasUsers() {
    return this.users.length > 0;
  }

  get userCount() {
    return this.users.length;
  }

  @action
  async loadUsers() {
    this.isLoading = true;
    this.users = await this.store.findAll('user');
    this.isLoading = false;
  }

  @action
  goToDetail(userId) {
    this.router.transitionTo('users.detail', userId);
  }

  @action
  deleteUser(user) {
    user.destroyRecord();
    this.notifications.success('User deleted');
  }
}
