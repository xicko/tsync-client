package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type CronLogStatus string

const (
	CronLogStatusSuccess CronLogStatus = "SUCCESS"
	CronLogStatusFailed  CronLogStatus = "FAILED"
)

type CronLog struct {
	ID         bson.ObjectID `bson:"_id,omitempty" json:"_id"`
	Name       string        `bson:"name" json:"name"`
	Status     CronLogStatus `bson:"status" json:"status"`
	Output     string        `bson:"output,omitempty" json:"output,omitempty"`
	DurationMs int64         `bson:"durationMs" json:"durationMs"`
	CreatedAt  time.Time     `bson:"createdAt" json:"createdAt"`
	UpdatedAt  time.Time     `bson:"updatedAt" json:"updatedAt"`
	Version    int           `bson:"__v" json:"__v"`
}
