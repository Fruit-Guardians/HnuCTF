package i18ntool

import (
	"a1ctf/src/utils/zaphelper"

	"github.com/BurntSushi/toml"
	"github.com/gin-gonic/gin"
	"github.com/nicksnyder/go-i18n/v2/i18n"
	"go.uber.org/zap"
	"golang.org/x/text/language"
)

var (
	locMap = make(map[string]*i18n.Localizer)
)

func LoadLanguageFiles() {
	bundle := i18n.NewBundle(language.English)
	bundle.RegisterUnmarshalFunc("toml", toml.Unmarshal)

	// 加载翻译文件
	bundle.MustLoadMessageFile("./i18n/admin.en.toml")
	bundle.MustLoadMessageFile("./i18n/admin.zh.toml")
	bundle.MustLoadMessageFile("./i18n/user.en.toml")
	bundle.MustLoadMessageFile("./i18n/user.zh.toml")

	// 创建本地化器
	locMap["en"] = i18n.NewLocalizer(bundle, "en")
	locMap["zh"] = i18n.NewLocalizer(bundle, "zh")
}

func Translate(c *gin.Context, config *i18n.LocalizeConfig) string {
	language := c.GetHeader("Accept-Language")
	if language == "" {
		if _language, err := c.Cookie("i18next"); err == nil {
			language = _language
		} else {
			language = "en"
		}
	}

	loc, ok := locMap[language]
	if !ok {
		loc = locMap["en"]
	}

	translated, err := loc.Localize(config)
	if err != nil {
		zaphelper.Logger.Error("i18n failed", zap.Any("err", err))
		return "I18n Error"
	}

	return translated
}
