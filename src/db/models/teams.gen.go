package models

import (
	"database/sql/driver"
	"errors"

	"github.com/bytedance/sonic"
	"github.com/lib/pq"
)

const TableNameTeam = "teams"
const TableNameTeamMember = "team_members"

type ParticipationStatus string

const (
	ParticipateUnRegistered ParticipationStatus = "UnRegistered" // 未报名
	ParticipatePending      ParticipationStatus = "Pending"      // 已报名，等待审核
	ParticipateApproved     ParticipationStatus = "Approved"     // 已报名，审核通过
	ParticipateRejected     ParticipationStatus = "Rejected"     // 已报名，审核不通过
	ParticipateParticipated ParticipationStatus = "Participated" // 已报名，已参加
	ParticipateBanned       ParticipationStatus = "Banned"       // 已被禁赛
	ParticipateUnLogin      ParticipationStatus = "UnLogin"      // 未登录
)

func (e ParticipationStatus) Value() (driver.Value, error) {
	return sonic.Marshal(e)
}

func (e *ParticipationStatus) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return sonic.Unmarshal(b, e)
}

type TeamType string

const (
	TeamTypePlayer TeamType = "Player"
	TeamTypeAdmin  TeamType = "Admin"
)

func (e TeamType) Value() (driver.Value, error) {
	return sonic.Marshal(e)
}

func (e *TeamType) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return sonic.Unmarshal(b, e)
}

// Team 团队模型
type Team struct {
	TeamID          int64               `gorm:"column:team_id;primaryKey;autoIncrement" json:"team_id"`
	GameID          int64               `gorm:"column:game_id;not null" json:"game_id"`
	TeamName        string              `gorm:"column:team_name;not null" json:"team_name"`
	TeamAvatar      *string             `gorm:"column:team_avatar" json:"team_avatar"`
	TeamSlogan      *string             `gorm:"column:team_slogan" json:"team_slogan"`
	TeamDescription *string             `gorm:"column:team_description" json:"team_description"`
	TeamMembers     pq.StringArray      `gorm:"column:team_members;type:text[]" json:"team_members"`
	TeamScore       float64             `gorm:"column:team_score;not null;default:0" json:"team_score"`
	TeamHash        string              `gorm:"column:team_hash;not null" json:"team_hash"`
	InviteCode      *string             `gorm:"column:invite_code" json:"invite_code"`
	TeamStatus      ParticipationStatus `gorm:"column:team_status;not null" json:"team_status"`
	GroupID         *int64              `gorm:"column:group_id" json:"group_id"`
	TeamType        TeamType            `gorm:"column:team_type;not null" json:"team_type"`

	// 关联
	Group *GameGroup `gorm:"foreignKey:GroupID;references:group_id" json:"group,omitempty"`
}

// TableName 获取Team的表名
func (*Team) TableName() string {
	return TableNameTeam
}
