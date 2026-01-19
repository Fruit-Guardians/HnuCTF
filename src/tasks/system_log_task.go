package tasks

import (
	"a1ctf/src/db/models"
	dbtool "a1ctf/src/utils/db_tool"
	"context"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/hibiken/asynq"
	"github.com/vmihailenco/msgpack/v5"
)

type LogEntry struct {
	Category     models.LogCategory `json:"category"`
	UserID       *string            `json:"user_id,omitempty"`
	Username     *string            `json:"username,omitempty"`
	Action       string             `json:"action"`
	ResourceType string             `json:"resource_type"`
	ResourceID   *string            `json:"resource_id,omitempty"`
	Details      interface{}        `json:"details,omitempty"`
	IPAddress    *string            `json:"ip_address,omitempty"`
	UserAgent    *string            `json:"user_agent,omitempty"`
	Status       string             `json:"status"`
	ErrorMessage *string            `json:"error_message,omitempty"`
	GameID       *int64             `json:"game_id,omitempty"`
	ChallengeID  *int64             `json:"challenge_id,omitempty"`
	TeamID       *int64             `json:"team_id,omitempty"`
}

type TaskLogEntry struct {
	Entry      LogEntry
	LoggedTime time.Time
}

func LogOperation(entry LogEntry) error {
	taskPayload := TaskLogEntry{
		Entry:      entry,
		LoggedTime: time.Now(),
	}

	return NewSystemLogTask(taskPayload)
}

func LogFromGinContext(c *gin.Context, entry LogEntry) error {
	user, exists := c.Get("user")

	if exists {
		user := user.(models.User)
		entry.UserID = &user.UserID
		entry.Username = &user.Username
	}

	// 提取IP地址
	clientIP := c.ClientIP()
	entry.IPAddress = &clientIP

	// 提取User-Agent
	userAgent := c.GetHeader("User-Agent")
	if userAgent != "" {
		entry.UserAgent = &userAgent
	}

	return LogOperation(entry)
}

func LogAdminOperation(c *gin.Context, action, resourceType string, resourceID *string, details interface{}) error {
	return LogFromGinContext(c, LogEntry{
		Category:     models.LogCategoryAdmin,
		Action:       action,
		ResourceType: resourceType,
		ResourceID:   resourceID,
		Details:      details,
		Status:       models.LogStatusSuccess,
	})
}

func LogAdminOperationWithError(c *gin.Context, action, resourceType string, resourceID *string, details interface{}, err error) error {
	status := models.LogStatusSuccess
	var errorMessage *string

	if err != nil {
		status = models.LogStatusFailed
		errMsg := err.Error()
		errorMessage = &errMsg
	}

	return LogFromGinContext(c, LogEntry{
		Category:     models.LogCategoryAdmin,
		Action:       action,
		ResourceType: resourceType,
		ResourceID:   resourceID,
		Details:      details,
		Status:       status,
		ErrorMessage: errorMessage,
	})
}

func LogUserOperation(c *gin.Context, action, resourceType string, resourceID *string, details interface{}) error {
	return LogFromGinContext(c, LogEntry{
		Category:     models.LogCategoryUser,
		Action:       action,
		ResourceType: resourceType,
		ResourceID:   resourceID,
		Details:      details,
		Status:       models.LogStatusSuccess,
	})
}

func LogUserOperationWithError(c *gin.Context, action, resourceType string, resourceID *string, details interface{}, err error) error {
	status := models.LogStatusSuccess
	var errorMessage *string

	if err != nil {
		status = models.LogStatusFailed
		errMsg := err.Error()
		errorMessage = &errMsg
	}

	return LogFromGinContext(c, LogEntry{
		Category:     models.LogCategoryUser,
		Action:       action,
		ResourceType: resourceType,
		ResourceID:   resourceID,
		Details:      details,
		Status:       status,
		ErrorMessage: errorMessage,
	})
}

func LogContainerOperation(userID *string, username *string, action string, containerID string, details interface{}, err error) error {
	status := models.LogStatusSuccess
	var errorMessage *string

	if err != nil {
		status = models.LogStatusFailed
		errMsg := err.Error()
		errorMessage = &errMsg
	}

	return LogOperation(LogEntry{
		Category:     models.LogCategoryContainer,
		UserID:       userID,
		Username:     username,
		Action:       action,
		ResourceType: models.ResourceTypeContainer,
		ResourceID:   &containerID,
		Details:      details,
		Status:       status,
		ErrorMessage: errorMessage,
	})
}

func LogJudgeOperation(userID *string, username *string, action string, judgeID string, details interface{}, err error) error {
	status := models.LogStatusSuccess
	var errorMessage *string

	if err != nil {
		status = models.LogStatusFailed
		errMsg := err.Error()
		errorMessage = &errMsg
	}

	return LogOperation(LogEntry{
		Category:     models.LogCategoryJudge,
		UserID:       userID,
		Username:     username,
		Action:       action,
		ResourceType: "JUDGE",
		ResourceID:   &judgeID,
		Details:      details,
		Status:       status,
		ErrorMessage: errorMessage,
	})
}

func LogSystemOperation(action string, details interface{}, err error) error {
	status := models.LogStatusSuccess
	var errorMessage *string

	if err != nil {
		status = models.LogStatusFailed
		errMsg := err.Error()
		errorMessage = &errMsg
	}

	return LogOperation(LogEntry{
		Category:     models.LogCategorySystem,
		Action:       action,
		ResourceType: models.ResourceTypeSystem,
		Details:      details,
		Status:       status,
		ErrorMessage: errorMessage,
	})
}

func LogSecurityOperation(c *gin.Context, action string, details interface{}, err error) error {
	status := models.LogStatusSuccess
	var errorMessage *string

	if err != nil {
		status = models.LogStatusFailed
		errMsg := err.Error()
		errorMessage = &errMsg
	}

	return LogFromGinContext(c, LogEntry{
		Category:     models.LogCategorySecurity,
		Action:       action,
		ResourceType: "SECURITY",
		Details:      details,
		Status:       status,
		ErrorMessage: errorMessage,
	})
}

func NewSystemLogTask(entry TaskLogEntry) error {
	payload, err := msgpack.Marshal(entry)
	if err != nil {
		return err
	}

	task := asynq.NewTask(TypeNewSystemLog, payload)
	_, err = client.Enqueue(task)

	return err
}

func HandleSystemLogTask(ctx context.Context, t *asynq.Task) error {
	var p TaskLogEntry
	if err := msgpack.Unmarshal(t.Payload(), &p); err != nil {
		return fmt.Errorf("json.Unmarshal failed: %v: %w", err, asynq.SkipRetry)
	}

	entry := p.Entry

	logModel := models.SystemLog{
		LogCategory:  entry.Category,
		UserID:       entry.UserID,
		Username:     entry.Username,
		Action:       entry.Action,
		ResourceType: entry.ResourceType,
		ResourceID:   entry.ResourceID,
		Details:      entry.Details,
		IPAddress:    entry.IPAddress,
		UserAgent:    entry.UserAgent,
		Status:       entry.Status,
		ErrorMessage: entry.ErrorMessage,
		CreateTime:   p.LoggedTime,
		GameID:       entry.GameID,
		ChallengeID:  entry.ChallengeID,
		TeamID:       entry.TeamID,
	}

	err := dbtool.DB().Create(&logModel).Error

	if err != nil {
		return fmt.Errorf("failed to create system log: %w", err)
	}

	return nil
}
