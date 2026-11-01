package models

import "time"

type DeviceAdbConfig struct {
	Port *int `bson:"port,omitempty" json:"port,omitempty"`
}

type DeviceAndroidConfig struct {
	Adb *DeviceAdbConfig `bson:"adb,omitempty" json:"adb,omitempty"`
}

type DeviceWindowsConfig struct {
	MacAddress *string `bson:"macAddress,omitempty" json:"macAddress,omitempty"`
}

// _id is the tailscale device id
type DeviceConfig struct {
	ID            string              `bson:"_id" json:"_id"`
	BatterySync   bool                `bson:"batterySync" json:"batterySync"`
	AndroidConfig DeviceAndroidConfig `bson:"androidConfig" json:"androidConfig"`
	WindowsConfig DeviceWindowsConfig `bson:"windowsConfig" json:"windowsConfig"`
	CreatedAt     time.Time           `bson:"createdAt" json:"createdAt"`
	UpdatedAt     time.Time           `bson:"updatedAt" json:"updatedAt"`
	Version       int                 `bson:"__v" json:"__v"`
}
