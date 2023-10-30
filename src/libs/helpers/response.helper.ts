import { HttpException } from '@nestjs/common';

export interface IPagination {
  take: number;
  page: number;
  total: number;
}

export interface IOkResponse {
  message: string;
}

export interface ISuccessResponse<T> {
  message: string;
  data: T;
}

export interface ISuccessPaginationResponse<T> {
  message: string;
  data: T;
  pagination: {
    limit: number;
    total_page: number;
    current_page: number;
  };
}

export class ResponseHelper {
  ok(message = 'ok'): IOkResponse {
    return {
      message,
    };
  }

  success<T extends object>(options: {
    message?: string;
    data?: T;
  }): ISuccessResponse<T> {
    const message = options.message ?? 'success';
    const data = options.data ?? null;

    return {
      message,
      data,
    };
  }

  successPagination<T extends object>(options: {
    data?: T;
    paginations?: IPagination;
  }): ISuccessPaginationResponse<T> {
    const { take, page, total } = options.paginations;

    const pagination = {
      limit: take,
      current_page: page,
      total_page: Math.ceil(total / take),
      total_data: total,
    };

    return {
      message: 'ok',
      data: options.data,
      pagination,
    };
  }

  error(err: any): Promise<never> {
    const message = err.message ?? 'internal server error';
    return Promise.reject(new HttpException({ message }, 400));
  }
}
