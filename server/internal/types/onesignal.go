package types

// TODO: will sunset onesignal & migrate to FCM

type OneSignalSegmentType string

const (
	OneSignalSegmentActive   OneSignalSegmentType = "Active Subscriptions"
	OneSignalSegmentTotal    OneSignalSegmentType = "Total Subscriptions"
	OneSignalSegmentInactive OneSignalSegmentType = "Inactive Subscriptions"
	OneSignalSegmentEngaged  OneSignalSegmentType = "Engaged Subscriptions"
)

type OneSignalTargetChannel string

const (
	OneSignalTargetChannelPush  OneSignalTargetChannel = "push"
	OneSignalTargetChannelEmail OneSignalTargetChannel = "email"
	OneSignalTargetChannelSMS   OneSignalTargetChannel = "sms"
)

type OneSignalCustomDataType struct {
	Type string `json:"type"`
	Data any    `json:"data,omitempty"`
}

type OneSignalPayloadType struct {
	AppID                  string                   `json:"app_id"`
	IncludeExternalUserIDs []string                 `json:"include_external_user_ids,omitempty"`
	IncludedSegments       []OneSignalSegmentType   `json:"included_segments,omitempty"`
	TargetChannel          OneSignalTargetChannel   `json:"target_channel"`
	EmailTo                []string                 `json:"email_to,omitempty"`
	Headings               map[string]string        `json:"headings"`
	Contents               map[string]string        `json:"contents"`
	Data                   *OneSignalCustomDataType `json:"data,omitempty"`
	AndroidChannelID       string                   `json:"android_channel_id,omitempty"`
	Priority               *int                     `json:"priority,omitempty"`
}
