package models

import (
	"time"

	"github.com/xicko/tsync/internal/types"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type NotificationsSyncLog struct {
	ID          bson.ObjectID                           `bson:"_id,omitempty" json:"_id"`
	Type        types.NotificationOS                    `bson:"type" json:"type"`
	TailscaleID string                                  `bson:"tailscaleId" json:"tailscaleId"`
	Timestamp   int64                                   `bson:"timestamp" json:"timestamp"` // sent from client
	Android     *types.CollectedNotificationAndroidData `bson:"android,omitempty" json:"android,omitempty"`
	CreatedAt   time.Time                               `bson:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time                               `bson:"updatedAt" json:"updatedAt"`
	Version     int                                     `bson:"__v" json:"__v"`
}
