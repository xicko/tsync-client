package types

type RealtimeNoteMessageType struct {
	ID                  string          `json:"id"`
	Message             string          `json:"message"`
	Timestamp           int64           `json:"timestamp"`
	TailscaleDeviceData TailscaleDevice `json:"tailscaleDeviceData"`
}

type ShellEventPayload struct {
	DeviceID string `json:"deviceId"`
	Type     string `json:"type"` // "ADB"
	Command  string `json:"command"`
}
