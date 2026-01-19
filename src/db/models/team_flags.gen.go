package models

const TableNameTeamFlags = "team_flags"

// Team mapped from table <team_flags>
type TeamFlag struct {
	FlagID      int64     `gorm:"primaryKey;column:flag_id;autoIncrement" json:"flag_id"`
	FlagContent string    `gorm:"column:flag_content;type:text;not null" json:"flag_content"`
	TeamID      int64     `gorm:"column:team_id;not null" json:"team_id"`
	Team        Team      `gorm:"foreignKey:TeamID;references:team_id" json:"-"`
	GameID      int64     `gorm:"column:game_id;not null" json:"game_id"`
	Game        Game      `gorm:"foreignKey:GameID;references:game_id" json:"-"`
	ChallengeID int64     `gorm:"column:challenge_id;not null" json:"challenge_id"`
	Challenge   Challenge `gorm:"foreignKey:ChallengeID;references:challenge_id" json:"-"`
}

// TableName Team's table name
func (*TeamFlag) TableName() string {
	return TableNameTeamFlags
}
