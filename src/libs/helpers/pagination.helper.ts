export interface IQueryPagination {
  limit: string;
  page: string;
  search: string;
}

export class PaginationHelper {
  take: number;
  skip: number;
  page: number;
  search: string;

  constructor(options: IQueryPagination) {
    const pageRaw = options.page ?? '1';
    const limit = options.limit ?? '20';

    this.take = Number(limit);
    this.page = Number(pageRaw);
    this.skip = (this.page - 1) * this.take;
    this.search = options.search ?? null;
  }
}
