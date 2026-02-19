import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class PaginationComponent extends Component {
  @tracked currentPage = 1;
  @tracked totalItems = 0;
  @tracked itemsPerPage = 10;

  constructor(owner, args) {
    super(owner, args);
    this.totalItems = args.totalItems ?? 0;
    this.itemsPerPage = args.itemsPerPage ?? 10;
  }

  get totalPages() {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get hasNextPage() {
    return this.currentPage < this.totalPages;
  }

  get hasPreviousPage() {
    return this.currentPage > 1;
  }

  get pageInfo() {
    return `Page ${this.currentPage} of ${this.totalPages}`;
  }

  nextPage() {
    if (this.hasNextPage) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.hasPreviousPage) {
      this.currentPage--;
    }
  }

  goToPage(page) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  setItemsPerPage(count) {
    this.itemsPerPage = count;
    this.currentPage = 1;
  }
}
