export interface PaginationResponse {
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}
