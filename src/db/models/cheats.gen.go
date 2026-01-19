package models

import (
	"database/sql/driver"
	"errors"
	"time"

	"github.com/bytedance/sonic"
)

type CheatType string

const (
	CheatSubmitSomeonesFlag               = "SubmitSomeonesFlag"
	CheatSubmitWithoutDownloadAttachments = "SubmitWithoutDownloadAttachments"
	CheatSubmitWithoutStartContainer      = "SubmitWithoutStartContainer"
)

type CheatExtraData struct {
	RelevantTeam     int64  `json:"relevant_team"`
	RelevantTeamName string `json:"relevant_teamname"`
}

func (e CheatExtraData) Value() (driver.Value, error) {
	return sonic.Marshal(e)
}

func (e *CheatExtraData) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return sonic.Unmarshal(b, e)
}

func (e CheatType) Value() (driver.Value, error) {
	return sonic.Marshal(e)
}

func (e *CheatType) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return sonic.Unmarshal(b, e)
}

const TableNameCheat = "cheats"

// Cheat mapped from table <cheats>
type Cheat struct {
	CheatID       string         `gorm:"column:cheat_id;primaryKey" json:"cheat_id"`
	CheatType     CheatType      `gorm:"column:cheat_type;not null" json:"cheat_type"`
	GameID        int64          `gorm:"column:game_id;not null" json:"game_id"`
	Game          Game           `gorm:"foreignKey:GameID;references:game_id" json:"-"`
	IngameID      int64          `gorm:"column:ingame_id;not null" json:"ingame_id"`
	GameChallenge GameChallenge  `gorm:"foreignKey:IngameID;references:ingame_id" json:"-"`
	ChallengeID   int64          `gorm:"column:challenge_id;not null" json:"challenge_id"`
	Challenge     Challenge      `gorm:"foreignKey:ChallengeID;references:challenge_id" json:"-"`
	TeamID        int64          `gorm:"column:team_id;not null" json:"team_id"`
	Team          Team           `gorm:"foreignKey:TeamID;references:team_id" json:"-"`
	FlagID        *int64         `gorm:"column:flag_id" json:"flag_id"`
	TeamFlag      *TeamFlag      `gorm:"foreignKey:FlagID;references:flag_id" json:"-"`
	JudgeID       string         `gorm:"column:judge_id;not null" json:"judge_id"`
	Judge         Judge          `gorm:"foreignKey:JudgeID;references:judge_id" json:"-"`
	SubmiterID    string         `gorm:"column:submiter_id;not null" json:"submiter_id"`
	Submiter      User           `gorm:"foreignKey:SubmiterID;references:user_id" json:"-"`
	ExtraData     CheatExtraData `gorm:"column:extra_data;type:jsonb" json:"extra_data"`
	CheatTime     time.Time      `gorm:"column:cheat_time;not null" json:"cheat_time"`
	SubmiterIP    *string        `gorm:"column:submiter_ip" json:"submiter_ip"`
}

// TableName Cheat's table name
func (*Cheat) TableName() string {
	return TableNameCheat
}
