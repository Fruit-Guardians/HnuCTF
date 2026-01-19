package validatortool

import (
	"unicode"

	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
)

func PasswordValidator(fl validator.FieldLevel) bool {
	password := fl.Field().String()

	if len(password) <= 6 {
		return false
	}

	hasLower := false
	hasUpper := false
	hasSpecial := false

	for _, char := range password {
		switch {
		case unicode.IsLower(char):
			hasLower = true
		case unicode.IsUpper(char):
			hasUpper = true
		case unicode.IsPunct(char) || unicode.IsSymbol(char):
			hasSpecial = true
		}
	}

	return hasLower && hasUpper && hasSpecial
}

var Validate *validator.Validate

func InitValidator() {

	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		Validate = v
	} else {
		panic("can not get gin's validator instance.")
	}

	// TODO: 优化表单错误信息, 支持 i18n

	err := Validate.RegisterValidation("password", PasswordValidator)
	if err != nil {
		panic(err)
	}
}
