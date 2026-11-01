package routes

import (
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/xicko/tsync/internal/response"
)

func notImplemented(w http.ResponseWriter, r *http.Request) {
	response.Error(w, http.StatusNotImplemented, "")
}

func notFound(w http.ResponseWriter, r *http.Request) {
	response.Error(w, http.StatusNotFound, fmt.Sprintf("Cannot %s %s", r.Method, r.URL.Path))
}

func New() chi.Router {
	r := chi.NewRouter()

	r.Use(middleware.StripSlashes)
	r.NotFound(notFound)
	r.MethodNotAllowed(notFound)

	r.Route("/sys", func(r chi.Router) {
		r.Get("/ping", notImplemented)
		r.Get("/ip", notImplemented)
	})

	r.Route("/crons", func(r chi.Router) {
		r.Get("/", notImplemented)
		r.Post("/", notImplemented)
		r.Post("/reinit/system", notImplemented)
		r.Patch("/{name}", notImplemented)
		r.Delete("/{name}", notImplemented)
		r.Post("/{name}/trigger", notImplemented)
		r.Get("/{name}/logs", notImplemented)
	})

	r.Route("/devices", func(r chi.Router) {
		r.Get("/", notImplemented)
		r.Post("/{tailscaleId}/wol", notImplemented)
		r.Patch("/{tailscaleId}/mac-address", notImplemented)
		r.Patch("/{tailscaleId}/battery-sync", notImplemented)

		r.Group(func(r chi.Router) {
			// TODO: TailscaleDeviceIpGuard
			r.Patch("/{tailscaleId}/battery", notImplemented)
		})
	})

	r.Route("/adb", func(r chi.Router) {
		r.Get("/connected", notImplemented)
		r.Patch("/devices/{tailscaleId}/identifier", notImplemented)
	})

	r.Route("/settings", func(r chi.Router) {
		r.Get("/alert", notImplemented)
		r.Patch("/alert", notImplemented)
		r.Get("/wol", notImplemented)
		r.Patch("/wol", notImplemented)
	})

	r.Route("/notifications-sync", func(r chi.Router) {
		r.Group(func(r chi.Router) {
			// TODO: TailscaleDeviceIpGuard
			r.Post("/devices/{tailscaleId}/notifications", notImplemented)
		})

		r.Group(func(r chi.Router) {
			// TODO: TailscaleIpGuard
			r.Get("/", notImplemented)
			r.Get("/denylist", notImplemented)
			r.Post("/denylist", notImplemented)
			r.Delete("/denylist/{id}", notImplemented)
		})
	})

	r.Route("/storage", func(r chi.Router) {
		// TODO: TailscaleIpGuard
		r.Post("/", notImplemented)
		r.Get("/", notImplemented)
		r.Get("/{id}", notImplemented)
		r.Delete("/{id}", notImplemented)
	})

	return r
}
