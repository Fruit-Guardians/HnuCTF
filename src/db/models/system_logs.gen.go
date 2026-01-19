package models

import (
	"database/sql/driver"
	"errors"
	"time"

	"github.com/bytedance/sonic"
)

const TableNameSystemLog = "system_logs"

type LogCategory string

const (
	LogCategoryAdmin     LogCategory = "ADMIN"     // 管理员操作
	LogCategoryUser      LogCategory = "USER"      // 用户操作
	LogCategorySystem    LogCategory = "SYSTEM"    // 系统操作
	LogCategoryContainer LogCategory = "CONTAINER" // 容器操作
	LogCategoryJudge     LogCategory = "JUDGE"     // 判题操作
	LogCategorySecurity  LogCategory = "SECURITY"  // 安全相关
)

func (e LogCategory) Value() (driver.Value, error) {
	return sonic.Marshal(e)
}

func (e *LogCategory) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return sonic.Unmarshal(b, e)
}

// SystemLog mapped from table <system_logs>
type SystemLog struct {
	LogID        int64       `gorm:"column:log_id;primaryKey;autoIncrement" json:"log_id"`
	LogCategory  LogCategory `gorm:"column:log_category;not null" json:"log_category"`
	UserID       *string     `gorm:"column:user_id" json:"user_id"`
	Username     *string     `gorm:"column:username" json:"username"`
	Action       string      `gorm:"column:action;not null" json:"action"`
	ResourceType string      `gorm:"column:resource_type;not null" json:"resource_type"`
	ResourceID   *string     `gorm:"column:resource_id" json:"resource_id"`
	Details      interface{} `gorm:"column:details;type:jsonb" json:"details"`
	IPAddress    *string     `gorm:"column:ip_address" json:"ip_address"`
	UserAgent    *string     `gorm:"column:user_agent" json:"user_agent"`
	Status       string      `gorm:"column:status;not null" json:"status"`
	ErrorMessage *string     `gorm:"column:error_message" json:"error_message"`
	CreateTime   time.Time   `gorm:"column:create_time;not null;default:CURRENT_TIMESTAMP" json:"create_time"`
	GameID       *int64      `gorm:"column:game_id" json:"game_id"`
	ChallengeID  *int64      `gorm:"column:challenge_id" json:"challenge_id"`
	TeamID       *int64      `gorm:"column:team_id" json:"team_id"`
}

// TableName SystemLog's table name
func (*SystemLog) TableName() string {
	return TableNameSystemLog
}

// 日志状态常量
const (
	LogStatusSuccess = "SUCCESS"
	LogStatusFailed  = "FAILED"
	LogStatusWarning = "WARNING"
)

// 资源类型常量
const (
	ResourceTypeUser      = "USER"
	ResourceTypeTeam      = "TEAM"
	ResourceTypeGame      = "GAME"
	ResourceTypeChallenge = "CHALLENGE"
	ResourceTypeContainer = "CONTAINER"
	ResourceTypeSystem    = "SYSTEM"
	ResourceTypeScore     = "SCORE"
	ResourceTypeFile      = "FILE"
)

// 操作类型常量
const (
	ActionCreate        = "CREATE"
	ActionUpdate        = "UPDATE"
	ActionDelete        = "DELETE"
	ActionLogin         = "LOGIN"
	ActionLogout        = "LOGOUT"
	ActionApprove       = "APPROVE"
	ActionReject        = "REJECT"
	ActionBan           = "BAN"
	ActionUnban         = "UNBAN"
	ActionResetPassword = "RESET_PASSWORD"
	ActionUpload        = "UPLOAD"
	ActionDownload      = "DOWNLOAD"
	ActionSubmitFlag    = "SUBMIT_FLAG"
	ActionJudge         = "JUDGE"

	// 容器任务
	ActionContainerStarting  = "CONTAINER_STARTING"
	ActionContainerStarted   = "CONTAINER_STARTED"
	ActionContainerStopping  = "CONTAINER_STOPPING"
	ActionContainerStopped   = "CONTAINER_STOPPED"
	ActionContainerExtending = "CONTAINER_EXTENDING"
	ActionContainerExtended  = "CONTAINER_EXTENDED"
	ActionContainerDeleting  = "CONTAINER_DELETING"
	ActionContainerDeleted   = "CONTAINER_DELETED"
	ActionContainerFailed    = "CONTAINER_FAILED"

	// 用户请求
	ActionStartContainer  = "START_CONTAINER"
	ActionStopContainer   = "STOP_CONTAINER"
	ActionExtendContainer = "EXTEND_CONTAINER"

	ActionView      = "VIEW"
	ActionTransfer  = "TRANSFER"
	ActionJoinTeam  = "JOIN_TEAM"
	ActionLeaveTeam = "LEAVE_TEAM"

	LoginSuccess = "LOGIN_SUCCESS"
)
