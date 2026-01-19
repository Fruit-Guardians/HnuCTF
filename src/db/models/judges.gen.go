package models

import (
	"database/sql/driver"
	"errors"
	"time"

	"github.com/bytedance/sonic"
)

type JudgeStatus string

const (
	JudgeQueueing JudgeStatus = "JudgeQueueing"
	JudgeRunning  JudgeStatus = "JudgeRunning"
	JudgeError    JudgeStatus = "JudgeError"
	JudgeWA       JudgeStatus = "JudgeWA"
	JudgeAC       JudgeStatus = "JudgeAC"
	JudgeTimeout  JudgeStatus = "JudgeTimeout"
)

func (e JudgeStatus) Value() (driver.Value, error) {
	return sonic.Marshal(e)
}

func (e *JudgeStatus) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return sonic.Unmarshal(b, e)
}

const TableNameJudge = "judges"

// Judge mapped from table <judges>
type Judge struct {
	IngameID      int64         `gorm:"column:ingame_id;not null" json:"ingame_id"`
	GameChallenge GameChallenge `gorm:"foreignKey:IngameID;references:ingame_id" json:"-"`
	GameID        int64         `gorm:"column:game_id;not null" json:"game_id"`
	Game          Game          `gorm:"foreignKey:GameID;references:game_id" json:"-"`
	ChallengeID   int64         `gorm:"column:challenge_id;not null" json:"challenge_id"`
	Challenge     Challenge     `gorm:"foreignKey:ChallengeID;references:challenge_id" json:"-"`
	TeamID        int64         `gorm:"column:team_id;not null" json:"team_id"`
	Team          Team          `gorm:"foreignKey:TeamID;references:team_id" json:"-"`
	FlagID        *int64        `gorm:"column:flag_id" json:"flag_id"`
	TeamFlag      TeamFlag      `gorm:"foreignKey:FlagID;references:flag_id" json:"team_flag"`
	JudgeType     JudgeType     `gorm:"column:judge_type;not null" json:"judge_type"`
	JudgeStatus   JudgeStatus   `gorm:"column:judge_status;not null" json:"judge_status"`
	JudgeResult   string        `gorm:"column:judge_result" json:"judge_result"`
	SubmiterID    string        `gorm:"column:submiter_id;not null" json:"submiter_id"`
	JudgeID       string        `gorm:"column:judge_id;primaryKey" json:"judge_id"`
	JudgeTime     time.Time     `gorm:"column:judge_time;not null" json:"judge_time"`
	JudgeContent  string        `gorm:"column:judge_content;not null" json:"judge_content"`
	SubmiterIP    *string       `gorm:"column:submiter_ip" json:"submiter_ip"`
}

// TableName Judge's table name
func (*Judge) TableName() string {
	return TableNameJudge
}
