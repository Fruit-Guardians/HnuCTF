package models

import (
	"database/sql/driver"
	"errors"
	"time"

	"github.com/bytedance/sonic"
)

const TableNameUser = "users"

type UserRole string

const (
	UserRoleAdmin   UserRole = "ADMIN"   // 管理员
	UserRoleUser    UserRole = "USER"    // 普通用户
	UserRoleMonitor UserRole = "MONITOR" // 观察者
)

func (e UserRole) Value() (driver.Value, error) {
	return sonic.Marshal(e)
}

func (e *UserRole) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return sonic.Unmarshal(b, e)
}

// User mapped from table <users>
type User struct {
	UserID        string    `gorm:"column:user_id;primaryKey" json:"user_id"`
	Username      string    `gorm:"column:username;not null" json:"username"`
	Password      string    `gorm:"column:password;not null" json:"password"`
	Salt          string    `gorm:"column:salt;not null" json:"salt"`
	Role          UserRole  `gorm:"column:role;not null" json:"role"`
	CurToken      *string   `gorm:"column:cur_token" json:"cur_token"`
	Phone         *string   `gorm:"column:phone" json:"phone"`
	StudentNumber *string   `gorm:"column:student_number" json:"student_number"`
	Realname      *string   `gorm:"column:realname" json:"realname"`
	Slogan        *string   `gorm:"column:slogan" json:"slogan"`
	Avatar        *string   `gorm:"column:avatar" json:"avatar"`
	SsoData       *string   `gorm:"column:sso_data" json:"sso_data"`
	JWTVersion    string    `gorm:"column:jwt_version" json:"jwt_version"`
	Email         *string   `gorm:"column:email" json:"email"`
	EmailVerified bool      `gorm:"column:email_verified" json:"email_verified"`
	RegisterTime  time.Time `gorm:"column:register_time" json:"register_time"`
	LastLoginTime time.Time `gorm:"column:last_login_time" json:"last_login_time"`
	LastLoginIP   *string   `gorm:"column:last_login_ip" json:"last_login_ip"`
	RegisterIP    *string   `gorm:"column:register_ip" json:"register_ip"`
}

type JWTUser struct {
	UserID     string
	UserName   string
	Role       UserRole
	JWTVersion string
}

// TableName User's table name
func (*User) TableName() string {
	return TableNameUser
}
