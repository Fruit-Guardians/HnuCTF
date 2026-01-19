package models

import (
	"database/sql/driver"
	"errors"
	"time"

	"github.com/bytedance/sonic"
)

const TableScoreboard = "scoreboard"

type ScoreBoardData struct {
	TeamName             string    `json:"team_name"`
	SolvedChallenges     []string  `json:"solved_challenges"`
	NewSolvedChallengeID *int64    `json:"new_solved"`
	Score                float64   `json:"score"`
	RecordTime           time.Time `json:"record_time"`
}

type ScoreBoardDatas []ScoreBoardData

func (e ScoreBoardDatas) Value() (driver.Value, error) {
	return sonic.Marshal(e)
}

func (e *ScoreBoardDatas) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return sonic.Unmarshal(b, e)
}

// Team mapped from table <team_flags>
type ScoreBoard struct {
	ScoreID        int64           `gorm:"primaryKey;column:score_id;autoIncrement" json:"score_id"`
	GameID         int64           `gorm:"column:game_id;not null" json:"game_id"`
	Game           Game            `gorm:"foreignKey:GameID;references:game_id" json:"-"`
	TeamID         int64           `gorm:"column:team_id;not null" json:"team_id"`
	Team           Team            `gorm:"foreignKey:TeamID;references:team_id" json:"-"`
	GenerateTime   time.Time       `gorm:"column:generate_time;not null" json:"generate_time"`
	Data           ScoreBoardDatas `gorm:"column:data;not null" json:"data"`
	CurScore       float64         `gorm:"column:cur_score;not null" json:"cur_score"`
	LastUpdateTime time.Time       `gorm:"column:last_update_time;not null" json:"last_update_time"`
}

// TableName Team's table name
func (*ScoreBoard) TableName() string {
	return TableScoreboard
}
