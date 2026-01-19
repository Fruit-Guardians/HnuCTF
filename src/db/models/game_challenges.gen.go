package models

import (
	"database/sql/driver"
	"errors"
	"time"

	"github.com/bytedance/sonic"
)

const TableNameGameChallenge = "game_challenges"

type Hint struct {
	Content    string    `json:"content"`
	CreateTime time.Time `json:"create_time"`
	Visible    bool      `json:"visible"`
}

type Hints []Hint

func (e Hints) Value() (driver.Value, error) {
	return sonic.Marshal(e)
}

func (e *Hints) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return sonic.Unmarshal(b, e)
}

type GameChallenge struct {
	IngameID     int64        `gorm:"column:ingame_id;primaryKey;autoIncrement:true" json:"ingame_id"`
	GameID       int64        `gorm:"column:game_id;not null" json:"game_id"`
	Game         Game         `gorm:"foreignKey:GameID;references:game_id" json:"-"`
	ChallengeID  int64        `gorm:"column:challenge_id;not null" json:"challenge_id"`
	Challenge    Challenge    `gorm:"foreignKey:ChallengeID;references:challenge_id" json:"-"`
	TotalScore   float64      `gorm:"column:total_score;not null" json:"total_score"`
	CurScore     float64      `gorm:"column:cur_score;not null" json:"cur_score"`
	SolveCount   int32        `gorm:"column:solve_count" json:"solve_count"`
	MinimalScore float64      `gorm:"column:minimal_score" json:"minimal_score"`
	Difficulty   float64      `gorm:"column:difficulty" json:"difficulty"`
	Hints        *Hints       `gorm:"column:hints;default:{}" json:"hints"`
	JudgeConfig  *JudgeConfig `gorm:"column:judge_config" json:"judge_config"`
	BelongStage  *string      `gorm:"column:belong_stage" json:"belong_stage"`
	Visible      bool         `gorm:"column:visible" json:"visible"`

	BloodRewardEnabled bool `gorm:"column:enable_blood_reward" json:"enable_blood_reward"`
	// Challenge Challenge `gorm:"foreignKey:challenge_id;references:challenges.challenge_id"`
}

// TableName GameChallenge's table name
func (*GameChallenge) TableName() string {
	return TableNameGameChallenge
}
