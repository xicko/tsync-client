package response

import (
	"encoding/json"
	"log/slog"
	"net/http"
)

// nest's HttpException body
type ErrorBody struct {
	Message    string `json:"message"`
	Error      string `json:"error,omitempty"`
	StatusCode int    `json:"statusCode"`
}

func JSON(w http.ResponseWriter, status int, v any) {
	jsonData, err := json.Marshal(v)
	if err != nil {
		slog.Error("response marshal failed", "error", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	w.Write(jsonData)
}

func Error(w http.ResponseWriter, status int, message string) {
	body := ErrorBody{
		Message:    message,
		Error:      http.StatusText(status),
		StatusCode: status,
	}
	if message == "" {
		body.Message = http.StatusText(status)
		body.Error = ""
	}
	JSON(w, status, body)
}

func NoContent(w http.ResponseWriter) {
	w.WriteHeader(http.StatusNoContent)
}
