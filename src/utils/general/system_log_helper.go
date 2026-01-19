package general

import (
	"a1ctf/src/db/models"
	dbtool "a1ctf/src/utils/db_tool"
	"fmt"
	"time"
)

// QuerySystemLogs 查询系统日志
func QuerySystemLogs(params QueryLogParams) ([]models.SystemLog, int64, error) {
	var logs []models.SystemLog
	var total int64

	query := dbtool.DB().Model(&models.SystemLog{})

	// 应用过滤条件
	if params.Category != nil {
		query = query.Where("log_category = ?", *params.Category)
	}

	if params.UserID != nil {
		query = query.Where("user_id = ?", *params.UserID)
	}

	if params.ResourceType != nil {
		query = query.Where("resource_type = ?", *params.ResourceType)
	}

	if params.Status != nil {
		query = query.Where("status = ?", *params.Status)
	}

	if params.StartTime != nil {
		query = query.Where("create_time >= ?", *params.StartTime)
	}

	if params.EndTime != nil {
		query = query.Where("create_time <= ?", *params.EndTime)
	}

	if params.IPAddress != nil {
		query = query.Where("ip_address = ?", *params.IPAddress)
	}

	if params.GameID != nil {
		query = query.Where("game_id = ?", *params.GameID)
	}

	if params.Keyword != nil {
		keyword := fmt.Sprintf("%%%s%%", *params.Keyword)
		query = query.Where("username ILIKE ? OR action ILIKE ? OR resource_type ILIKE ? OR resource_id ILIKE ?", keyword, keyword, keyword, keyword)
	}

	// 获取总数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 应用分页和排序
	offset := params.Offset
	if offset < 0 {
		offset = 0
	}

	size := params.Size
	if size <= 0 {
		size = 20
	}
	if size > 100 {
		size = 100
	}

	query = query.Order("create_time DESC").Offset(offset).Limit(size)

	// 执行查询
	if err := query.Find(&logs).Error; err != nil {
		return nil, 0, err
	}

	return logs, total, nil
}

// QueryLogParams 查询日志参数
type QueryLogParams struct {
	Category     *models.LogCategory `json:"category,omitempty"`
	UserID       *string             `json:"user_id,omitempty"`
	ResourceType *string             `json:"resource_type,omitempty"`
	Status       *string             `json:"status,omitempty"`
	StartTime    *time.Time          `json:"start_time,omitempty"`
	EndTime      *time.Time          `json:"end_time,omitempty"`
	IPAddress    *string             `json:"ip_address,omitempty"`
	GameID       *int64              `json:"game_id,omitempty"`
	Keyword      *string             `json:"keyword,omitempty"`
	Offset       int                 `json:"offset"`
	Size         int                 `json:"size"`
}
