package types

type TailscaleLatency struct {
	Preferred *bool    `json:"preferred,omitempty"`
	LatencyMs *float64 `json:"latencyMs,omitempty"`
}

type TailscaleClientSupports struct {
	HairPinning *bool `json:"hairPinning"`
	IPv6        *bool `json:"ipv6"`
	PCP         *bool `json:"pcp"`
	PMP         *bool `json:"pmp"`
	UDP         *bool `json:"udp"`
	UPnP        *bool `json:"upnp"`
}

type TailscaleClientConnectivity struct {
	Endpoints             []string                    `json:"endpoints,omitempty"`
	MappingVariesByDestIP *bool                       `json:"mappingVariesByDestIP,omitempty"`
	Latency               map[string]TailscaleLatency `json:"latency,omitempty"`
	ClientSupports        *TailscaleClientSupports    `json:"clientSupports,omitempty"`
}

type TailscalePostureIdentity struct {
	SerialNumbers []string `json:"serialNumbers,omitempty"`
	Disabled      *bool    `json:"disabled,omitempty"`
}

type TailscaleDistro struct {
	Name     string `json:"name,omitempty"`
	Version  string `json:"version,omitempty"`
	CodeName string `json:"codeName,omitempty"`
}

type BatteryStatus struct {
	Level     float64 `json:"level"`
	IsPlugged bool    `json:"isPlugged"`
	Timestamp int64   `json:"timestamp"`
}

type TailscaleAdbConfig struct {
	Port *int `json:"port,omitempty"`
}

type TailscaleAndroidConfig struct {
	Adb *TailscaleAdbConfig `json:"adb,omitempty"`
}

type TailscaleWindowsConfig struct {
	MacAddress string `json:"macAddress,omitempty"`
}

// fields added by tsync on top of the original tailscale api response
type TailscaleDeviceAdditionals struct {
	IsHost       *bool `json:"isHost,omitempty"`
	IsThisDevice *bool `json:"isThisDevice,omitempty"`

	BatterySync *bool          `json:"batterySync,omitempty"`
	Battery     *BatteryStatus `json:"battery,omitempty"`

	AndroidConfig *TailscaleAndroidConfig `json:"androidConfig,omitempty"`
	WindowsConfig *TailscaleWindowsConfig `json:"windowsConfig,omitempty"`
}

type TailscaleDevice struct {
	TailscaleDeviceAdditionals

	Addresses                 []string                     `json:"addresses"`
	ID                        string                       `json:"id"`
	NodeID                    string                       `json:"nodeId"`
	User                      string                       `json:"user"`
	Name                      string                       `json:"name"`
	Hostname                  string                       `json:"hostname"`
	ClientVersion             string                       `json:"clientVersion"`
	UpdateAvailable           bool                         `json:"updateAvailable"`
	OS                        string                       `json:"os"`
	Created                   string                       `json:"created"`
	ConnectedToControl        bool                         `json:"connectedToControl"`
	LastSeen                  string                       `json:"lastSeen,omitempty"`
	KeyExpiryDisabled         bool                         `json:"keyExpiryDisabled"`
	Expires                   string                       `json:"expires"`
	Authorized                bool                         `json:"authorized"`
	IsExternal                bool                         `json:"isExternal"`
	MultipleConnections       *bool                        `json:"multipleConnections,omitempty"`
	MachineKey                string                       `json:"machineKey"`
	NodeKey                   string                       `json:"nodeKey"`
	BlocksIncomingConnections bool                         `json:"blocksIncomingConnections"`
	EnabledRoutes             []string                     `json:"enabledRoutes"`
	AdvertisedRoutes          []string                     `json:"advertisedRoutes"`
	ClientConnectivity        *TailscaleClientConnectivity `json:"clientConnectivity,omitempty"`
	Tags                      []string                     `json:"tags"`
	TailnetLockError          string                       `json:"tailnetLockError"`
	TailnetLockKey            string                       `json:"tailnetLockKey"`
	SSHEnabled                bool                         `json:"sshEnabled"`
	PostureIdentity           *TailscalePostureIdentity    `json:"postureIdentity,omitempty"`
	IsEphemeral               bool                         `json:"isEphemeral"`
	Distro                    *TailscaleDistro             `json:"distro,omitempty"`
}

type TailscaleDevicesResponse struct {
	Devices []TailscaleDevice `json:"devices"`
}
