package models

import "time"

type GlobalAlertSettings struct {
	Enabled  bool     `bson:"enabled" json:"enabled"`
	Denylist []string `bson:"denylist" json:"denylist"` // tailscale device ids
}

type GlobalWolSettings struct {
	Enabled bool `bson:"enabled" json:"enabled"`
	Port    int  `bson:"port" json:"port"`
}

var DefaultGlobalAlertSettings = GlobalAlertSettings{
	Enabled:  false,
	Denylist: []string{},
}

var DefaultGlobalWolSettings = GlobalWolSettings{
	Enabled: true,
	Port:    2500,
}

// single document, _id is same as in constants.SettingsID
type Settings struct {
	ID        string              `bson:"_id" json:"_id"`
	Alert     GlobalAlertSettings `bson:"alert" json:"alert"`
	Wol       GlobalWolSettings   `bson:"wol" json:"wol"`
	CreatedAt time.Time           `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time           `bson:"updatedAt" json:"updatedAt"`
	Version   int                 `bson:"__v" json:"__v"`
}
