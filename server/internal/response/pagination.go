package response

import (
	"net/http"
	"strconv"
)

type Paginated[T any, P any] struct {
	Data       []T `json:"data"`
	Pagination P   `json:"pagination"`
}

type PagePagination struct {
	Total   int64 `json:"total"`
	Page    int   `json:"page"`
	Limit   int   `json:"limit"`
	HasNext bool  `json:"hasNext"`
	HasPrev bool  `json:"hasPrev"`
}

// notifications-sync list when ?timestamp= query param is given
type TimestampPagination struct {
	Total             int64  `json:"total"`
	Limit             int    `json:"limit"`
	HasNext           bool   `json:"hasNext"`
	Timestamp         int64  `json:"timestamp"`
	LastItemTimestamp *int64 `json:"lastItemTimestamp,omitempty"`
}

type ReqQuery struct {
	Page      int
	Limit     int
	Timestamp *int64
}

func (q ReqQuery) Skip() int64 {
	return int64(q.Page*q.Limit - q.Limit)
}

func ParseReqQuery(r *http.Request, defaultLimit int) ReqQuery {
	query := r.URL.Query()
	q := ReqQuery{
		Page:  1,
		Limit: defaultLimit,
	}

	if page, err := strconv.Atoi(query.Get("page")); err == nil && page > 0 {
		q.Page = page
	}
	if limit, err := strconv.Atoi(query.Get("limit")); err == nil && limit > 0 {
		q.Limit = limit
	}
	if ts, err := strconv.ParseInt(query.Get("timestamp"), 10, 64); err == nil {
		q.Timestamp = &ts
	}

	return q
}

func NewPagePagination(total int64, page, limit int) PagePagination {
	return PagePagination{
		Total:   total,
		Page:    page,
		Limit:   limit,
		HasNext: float64(total)/float64(limit) > float64(page),
		HasPrev: page > 1,
	}
}
