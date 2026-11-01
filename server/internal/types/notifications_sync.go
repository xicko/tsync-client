package types

type NotificationOS string

const (
	NotificationOSAndroid NotificationOS = "android"
	NotificationOSWindows NotificationOS = "windows"
)

type CollectedNotificationAndroidData struct {
	PackageName       string `bson:"packageName" json:"packageName"`
	Timestamp         int64  `bson:"timestamp" json:"timestamp"`
	Title             string `bson:"title" json:"title"`
	Text              string `bson:"text" json:"text"`
	BigText           string `bson:"bigText" json:"bigText"`
	InfoText          string `bson:"infoText" json:"infoText"`
	TitleBig          string `bson:"titleBig" json:"titleBig"`
	ConversationTitle string `bson:"conversationTitle" json:"conversationTitle"`
	PeopleList        string `bson:"peopleList" json:"peopleList"`
}

// placeholders, windows sync has no impl
type CollectedNotificationWindowsData struct {
	Timestamp int64  `json:"timestamp"`
	Title     string `json:"title"`
	Text      string `json:"text"`
}

// android or windows is set depending on type
type CollectedNotification struct {
	Type    NotificationOS                    `json:"type"`
	Android *CollectedNotificationAndroidData `json:"android,omitempty"`
	Windows *CollectedNotificationWindowsData `json:"windows,omitempty"`
}
