package models

import (
	"database/sql/driver"
	"errors"
	"time"

	"github.com/google/uuid"
)

const TableNameScoreAdjustment = "score_adjustments"

type AdjustmentType string

const (
	AdjustmentTypeCheat  AdjustmentType = "cheat"  // 作弊扣分
	AdjustmentTypeReward AdjustmentType = "reward" // 奖励加分
	AdjustmentTypeOther  AdjustmentType = "other"  // 其他调整
)

func (e AdjustmentType) Value() (driver.Value, error) {
	return string(e), nil
}

func (e *AdjustmentType) Scan(value interface{}) error {
	switch v := value.(type) {
	case string:
		*e = AdjustmentType(v)
	case []byte:
		*e = AdjustmentType(v)
	case nil:
		*e = ""
	default:
		return errors.New("cannot scan value into AdjustmentType")
	}
	return nil
}

// ScoreAdjustment 分数修正模型
type ScoreAdjustment struct {
	AdjustmentID   int64          `gorm:"column:adjustment_id;primaryKey;autoIncrement" json:"adjustment_id"`
	TeamID         int64          `gorm:"column:team_id;not null" json:"team_id"`
	GameID         int64          `gorm:"column:game_id;not null" json:"game_id"`
	AdjustmentType AdjustmentType `gorm:"column:adjustment_type;not null" json:"adjustment_type"`
	ScoreChange    float64        `gorm:"column:score_change;not null" json:"score_change"`
	Reason         string         `gorm:"column:reason;not null" json:"reason"`
	CreatedBy      uuid.UUID      `gorm:"column:created_by;not null" json:"created_by"`
	CreatedAt      time.Time      `gorm:"column:created_at;not null;default:NOW()" json:"created_at"`
	UpdatedAt      time.Time      `gorm:"column:updated_at;not null;default:NOW()" json:"updated_at"`

	// 关联
	Team          *Team `gorm:"foreignKey:TeamID;references:team_id" json:"team,omitempty"`
	Game          *Game `gorm:"foreignKey:GameID;references:game_id" json:"game,omitempty"`
	CreatedByUser *User `gorm:"foreignKey:CreatedBy;references:user_id" json:"created_by_user,omitempty"`
}

// TableName 获取ScoreAdjustment的表名
func (*ScoreAdjustment) TableName() string {
	return TableNameScoreAdjustment
}
