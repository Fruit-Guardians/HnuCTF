package general

import (
	"a1ctf/src/db/models"
	"a1ctf/src/utils/ristretto_tool"
)

func GetUserByUserID(userId string) *models.User {
	userList, err := ristretto_tool.CachedMemberMap()
	if err != nil {
		return nil
	}
	if user, ok := userList[userId]; ok {
		return &user
	}
	return nil
}

func FindUserNameByUserID(userId string) *string {
	user := GetUserByUserID(userId)
	if user == nil {
		return nil
	}
	return &user.Username
}
