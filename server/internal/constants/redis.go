package constants

const (
	RedisKeyDevices            = "devices"               // json []TailscaleDevice
	RedisKeyDeviceBatteries    = "device_batteries"      // hash, tailscaleId -> json BatteryStatus
	RedisKeyConnectedAdbDevice = "connected_adb_devices" // json []string of ip:port
)

const (
	RedisPrefixNotification  = "notification:"
	RedisPrefixAppIcon       = "app-icon:"
	RedisPrefixAppIconFailed = "app-icon-failed:"
	RedisPrefixWol           = "wol:"
)
