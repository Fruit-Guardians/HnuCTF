package models

import (
	k8stool "a1ctf/src/utils/k8s_tool"
	"database/sql/driver"
	"errors"
	"time"

	"github.com/bytedance/sonic"
)

const TableNameChallenge = "challenges"

type AttachmentType string

const (
	AttachmentTypeStaticFile  AttachmentType = "STATICFILE"
	AttachmentTypeDynamicFile AttachmentType = "DYNAMICFILE"
	AttachmentTypeRemoteFile  AttachmentType = "REMOTEFILE"
)

type AttachmentConfig struct {
	AttachName     string         `json:"attach_name"`
	AttachType     AttachmentType `json:"attach_type"`
	AttachURL      *string        `json:"attach_url,omitempty"`
	AttachHash     *string        `json:"attach_hash,omitempty"`
	DownloadHash   *string        `json:"download_hash,omitempty"`
	GenerateScript *string        `json:"generate_script,omitempty"`
}

type AttachmentConfigs []AttachmentConfig

func (e AttachmentConfigs) Value() (driver.Value, error) {
	return sonic.Marshal(e)
}

func (e *AttachmentConfigs) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return sonic.Unmarshal(b, e)
}

type JudgeType string

const (
	JudgeTypeDynamic JudgeType = "DYNAMIC"
	JudgeTypeScript  JudgeType = "SCRIPT"
)

func (e JudgeType) Value() (driver.Value, error) {
	return sonic.Marshal(e)
}

func (e *JudgeType) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return sonic.Unmarshal(b, e)
}

type JudgeConfig struct {
	JudgeType    JudgeType `json:"judge_type"`
	JudgeScript  *string   `json:"judge_script,omitempty"`
	FlagTemplate *string   `json:"flag_template,omitempty"`
}

func (e JudgeConfig) Value() (driver.Value, error) {
	return sonic.Marshal(e)
}

func (e *JudgeConfig) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return sonic.Unmarshal(b, e)
}

type ChallengeCategory string

const (
	CategoryWEB        ChallengeCategory = "WEB"
	CategoryPWN        ChallengeCategory = "PWN"
	CategoryREVERSE    ChallengeCategory = "REVERSE"
	CategoryMISC       ChallengeCategory = "MISC"
	CategoryCRYPTO     ChallengeCategory = "CRYPTO"
	CategoryPPC        ChallengeCategory = "PPC"
	CategoryAI         ChallengeCategory = "AI"
	CategoryBLOCKCHAIN ChallengeCategory = "BLOCKCHAIN"
	CategoryIOT        ChallengeCategory = "IOT"
	CategoryMOBILE     ChallengeCategory = "MOBILE"
	CategoryOSINT      ChallengeCategory = "OSINT"
	CategoryFORENSICS  ChallengeCategory = "FORENSICS"
	CategoryPENTEST    ChallengeCategory = "PENTEST"
	CategoryOTHER      ChallengeCategory = "OTHER"
)

func (e ChallengeCategory) Value() (driver.Value, error) {
	return sonic.Marshal(e)
}

func (e *ChallengeCategory) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return sonic.Unmarshal(b, e)
}

type ChallengeContainerType string

const (
	DYNAMIC_CONTAINER ChallengeContainerType = "DYNAMIC_CONTAINER"
	STATIC_CONTAINER  ChallengeContainerType = "STATIC_CONTAINER"
	NO_CONTAINER      ChallengeContainerType = "NO_CONTAINER"
)

func (e ChallengeContainerType) Value() (driver.Value, error) {
	return sonic.Marshal(e)
}

func (e *ChallengeContainerType) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return sonic.Unmarshal(b, e)
}

type FlagType string

const (
	FlagTypeDynamic FlagType = "FlagTypeDynamic"
	FlagTypeStatic  FlagType = "FlagTypeStatic"
)

func (e FlagType) Value() (driver.Value, error) {
	return sonic.Marshal(e)
}

func (e *FlagType) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return sonic.Unmarshal(b, e)
}

// Challenge mapped from table <challenges>
type Challenge struct {
	ChallengeID     *int64                 `gorm:"column:challenge_id;primaryKey;autoIncrement:true" json:"challenge_id"`
	Name            string                 `gorm:"column:name;not null" json:"name"`
	Description     string                 `gorm:"column:description;not null" json:"description"`
	Category        ChallengeCategory      `gorm:"column:category;not null" json:"category" binding:"required,oneof=WEB PWN REVERSE MISC CRYPTO PPC AI BLOCKCHAIN IOT MOBILE OSINT FORENSICS PENTEST OTHER"`
	Attachments     AttachmentConfigs      `gorm:"column:attachments;not null" json:"attachments"`
	ContainerType   ChallengeContainerType `gorm:"column:container_type;not null" json:"container_type"`
	ContainerConfig *k8stool.A1Containers  `gorm:"column:container_config" json:"container_config"`
	CreateTime      time.Time              `gorm:"column:create_time;not null" json:"create_time"`
	JudgeConfig     *JudgeConfig           `gorm:"column:judge_config" json:"judge_config"`
	AllowWAN        bool                   `gorm:"column:allow_wan;not null" json:"allow_wan"`
	AllowDNS        bool                   `gorm:"column:allow_dns;not null" json:"allow_dns"`
	FlagType        FlagType               `gorm:"column:flag_type" json:"flag_type"`
}

// TableName Challenge's table name
func (*Challenge) TableName() string {
	return TableNameChallenge
}
