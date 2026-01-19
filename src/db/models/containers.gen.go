package models

import (
	k8stool "a1ctf/src/utils/k8s_tool"
	"database/sql/driver"
	"errors"
	"time"

	"github.com/bytedance/sonic"
)

const TableNameContainer = "containers"

type ExposePort struct {
	PortName string `json:"port_name"`
	Port     int32  `json:"port"`
	IP       string `json:"ip"`
}

type ExposePorts []ExposePort

type ContainerExposeInfo struct {
	ContainerName string      `json:"container_name"`
	ExposePorts   ExposePorts `json:"expose_port"`
}

type ContainerExposeInfos []ContainerExposeInfo

func (e ExposePorts) Value() (driver.Value, error) {
	return sonic.Marshal(e)
}

func (e *ExposePorts) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return sonic.Unmarshal(b, e)
}

func (e ContainerExposeInfos) Value() (driver.Value, error) {
	return sonic.Marshal(e)
}

func (e *ContainerExposeInfos) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return sonic.Unmarshal(b, e)
}

type ContainerStatus string

const (
	ContainerStopped  ContainerStatus = "ContainerStopped"
	ContainerRunning  ContainerStatus = "ContainerRunning"
	ContainerStarting ContainerStatus = "ContainerStarting"
	ContainerError    ContainerStatus = "ContainerError"
	ContainerStopping ContainerStatus = "ContainerStopping"
	ContainerQueueing ContainerStatus = "ContainerQueueing"
	NoContainer       ContainerStatus = "NoContainer"
)

func (e ContainerStatus) Value() (driver.Value, error) {
	return sonic.Marshal(e)
}

func (e *ContainerStatus) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return sonic.Unmarshal(b, e)
}

// Container mapped from table <containers>
type Container struct {
	ContainerID          string               `gorm:"column:container_id;primaryKey" json:"container_id"`
	GameID               int64                `gorm:"column:game_id;not null" json:"game_id"`
	TeamID               int64                `gorm:"column:team_id;not null" json:"team_id"`
	Team                 Team                 `gorm:"foreignKey:TeamID;references:team_id" json:"-"`
	FlagID               int64                `gorm:"column:flag_id;not null" json:"flag_id"`
	ChallengeID          int64                `gorm:"column:challenge_id;not null" json:"challenge_id"`
	InGameID             int64                `gorm:"column:ingame_id;not null" json:"ingame_id"`
	GameChallenge        GameChallenge        `gorm:"foreignKey:InGameID;references:ingame_id" json:"-"`
	Challenge            Challenge            `gorm:"foreignKey:ChallengeID;references:challenge_id" json:"-"`
	StartTime            time.Time            `gorm:"column:start_time;not null" json:"start_time"`
	ExpireTime           time.Time            `gorm:"column:expire_time;not null" json:"expire_time"`
	ContainerExposeInfos ContainerExposeInfos `gorm:"column:expose_ports;not null" json:"expose_ports"`
	ContainerStatus      ContainerStatus      `gorm:"column:container_status;not null" json:"container_status"`
	TeamFlag             TeamFlag             `gorm:"foreignKey:FlagID;references:flag_id" json:"-"`
	ContainerConfig      k8stool.A1Containers `gorm:"column:container_config" json:"container_config"`
	ChallengeName        string               `gorm:"column:challenge_name;not null" json:"challenge_name"`
	TeamHash             string               `gorm:"column:team_hash;not null" json:"team_hash"`
	SubmiterIP           *string              `gorm:"column:submiter_ip" json:"submiter_ip"`
}

// TableName Container's table name
func (*Container) TableName() string {
	return TableNameContainer
}
