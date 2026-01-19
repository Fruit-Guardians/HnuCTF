package models

import (
	"time"
)

const TableNameUpload = "uploads"

// Upload mapped from table <uploads>
type Upload struct {
	FileID     string    `gorm:"column:file_id;primaryKey" json:"file_id"`
	UserID     string    `gorm:"column:user_id;not null" json:"user_id"`
	FileName   string    `gorm:"column:file_name;not null" json:"file_name"`
	FilePath   string    `gorm:"column:file_path;not null" json:"file_path"`
	FileHash   string    `gorm:"column:file_hash;not null" json:"file_hash"`
	FileType   string    `gorm:"column:file_type;not null" json:"file_type"`
	FileSize   int64     `gorm:"column:file_size;not null" json:"file_size"`
	UploadTime time.Time `gorm:"column:upload_time;not null" json:"upload_time"`
}

// TableName Upload's table name
func (*Upload) TableName() string {
	return TableNameUpload
}
