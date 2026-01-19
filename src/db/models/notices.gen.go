package models

import (
	"database/sql/driver"
	"errors"
	"time"

	"github.com/bytedance/sonic"
	"github.com/lib/pq"
)

const TableNameNotice = "notices"

// NoticeCategory defines possible categories for notices
type NoticeCategory string

const (
	NoticeFirstBlood   NoticeCategory = "FirstBlood"
	NoticeSecondBlood  NoticeCategory = "SecondBlood"
	NoticeThirdBlood   NoticeCategory = "ThirdBlood"
	NoticeNewChallenge NoticeCategory = "NewChallenge"
	NoticeNewHint      NoticeCategory = "NewHint"
	NoticeNewAnnounce  NoticeCategory = "NewAnnouncement"
)

func (e NoticeCategory) Value() (driver.Value, error) {
	return sonic.Marshal(e)
}

func (e *NoticeCategory) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return sonic.Unmarshal(b, e)
}

// Notice mapped from table <notices>
type Notice struct {
	NoticeID       int64          `gorm:"column:notice_id;primaryKey;autoIncrement:true" json:"notice_id"`
	GameID         int64          `gorm:"column:game_id;not null" json:"game_id"`
	Announced      bool           `gorm:"column:announced;not null" json:"announced"`
	CreateTime     time.Time      `gorm:"column:create_time;not null" json:"create_time"`
	NoticeCategory NoticeCategory `gorm:"column:notice_category;not null" json:"notice_category"`
	Data           pq.StringArray `gorm:"column:data;type:text[];not null" json:"data"`
}

// TableName Notice's table name
func (*Notice) TableName() string {
	return TableNameNotice
}
