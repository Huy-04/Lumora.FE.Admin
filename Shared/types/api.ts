export interface ProblemErrorDetail {
  field: string;
  errorCode: string;
  parameter?: Record<string, unknown> | null;
}

export type ValidationProblemErrors = Record<string, string[] | string>;

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string | null;
  instance?: string;
  traceId?: string;
  errorCode?: string;
  errorCategory?: string;
  errors?: ProblemErrorDetail[] | ValidationProblemErrors;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  size: number;
  totalPages: number;
}
