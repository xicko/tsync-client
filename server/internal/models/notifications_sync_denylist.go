package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type DenyType string

const (
	DenyTypeText              DenyType = "text"
	DenyTypePackageIdentifier DenyType = "packageIdentifier"
)

type NotificationsSyncDenylist struct {
	ID                bson.ObjectID `bson:"_id,omitempty" json:"_id"`
	Type              DenyType      `bson:"type" json:"type"`
	TailscaleID       string        `bson:"tailscaleId,omitempty" json:"tailscaleId,omitempty"`
	Text              string        `bson:"text,omitempty" json:"text,omitempty"`
	PackageIdentifier string        `bson:"packageIdentifier,omitempty" json:"packageIdentifier,omitempty"`
	CreatedAt         time.Time     `bson:"createdAt" json:"createdAt"`
	UpdatedAt         time.Time     `bson:"updatedAt" json:"updatedAt"`
	Version           int           `bson:"__v" json:"__v"`
}
