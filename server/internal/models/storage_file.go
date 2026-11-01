package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type StorageLocation string

const (
	StorageLocationHost     StorageLocation = "host"
	StorageLocationSupabase StorageLocation = "supabase"
)

// json:"-" fields are never sent to clients (=== stripFile)
type StorageFile struct {
	ID             bson.ObjectID   `bson:"_id,omitempty" json:"_id"`
	StoredIn       StorageLocation `bson:"storedIn" json:"-"`
	TailscaleID    string          `bson:"tailscaleId" json:"tailscaleId"`
	Name           string          `bson:"name" json:"name"`
	Path           string          `bson:"path" json:"-"`
	SupabaseBucket string          `bson:"supabaseBucket,omitempty" json:"-"`
	SizeBytes      int64           `bson:"sizeBytes" json:"sizeBytes"`
	Mimetype       string          `bson:"mimetype,omitempty" json:"mimetype,omitempty"`
	Sha256         string          `bson:"sha256" json:"sha256"`
	Md5            string          `bson:"md5" json:"md5"`
	CorruptedAt    *time.Time      `bson:"corruptedAt,omitempty" json:"corruptedAt,omitempty"`
	ExpiresAt      *time.Time      `bson:"expiresAt,omitempty" json:"expiresAt,omitempty"`
	CreatedAt      time.Time       `bson:"createdAt" json:"createdAt"`
	UpdatedAt      time.Time       `bson:"updatedAt" json:"updatedAt"`
	Version        int             `bson:"__v" json:"-"`
}
