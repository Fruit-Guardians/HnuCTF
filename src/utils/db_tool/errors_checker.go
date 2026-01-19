package dbtool

import (
	"errors"

	"gorm.io/gorm"
)

func IsDuplicateKeyError(err error) bool {
	if err == nil {
		return false
	}

	return errors.Is(err, gorm.ErrDuplicatedKey)
}
