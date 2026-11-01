package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type CronType string

const (
	CronTypeReminder    CronType = "REMINDER"
	CronTypeCount       CronType = "COUNT"
	CronTypeHealthcheck CronType = "HEALTHCHECK"
)

type CronConfig struct {
	ID             bson.ObjectID  `bson:"_id,omitempty" json:"_id"`
	Name           string         `bson:"name" json:"name"`
	Type           CronType       `bson:"type" json:"type"`
	CronExpression string         `bson:"cronExpression" json:"cronExpression"`
	Data           map[string]any `bson:"data" json:"data"`
	IsActive       bool           `bson:"isActive" json:"isActive"`
	CreatedAt      time.Time      `bson:"createdAt" json:"createdAt"`
	UpdatedAt      time.Time      `bson:"updatedAt" json:"updatedAt"`
	Version        int            `bson:"__v" json:"__v"`
}
