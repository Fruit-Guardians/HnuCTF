package controllers

import (
	"a1ctf/src/db/models"
	dbtool "a1ctf/src/utils/db_tool"
	i18ntool "a1ctf/src/utils/i18n_tool"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/nicksnyder/go-i18n/v2/i18n"
	"gorm.io/gorm"
)

type ExtractOption struct {
	Enabled      bool
	ExtraceModel bool
	Preloads     []string
}

type PathParmsMiddlewareProps struct {
	ExtractGame          ExtractOption
	ExtractChallenge     ExtractOption
	ExtractGameChallenge ExtractOption
	ExtractTeam          ExtractOption
}

func PathParmsMiddleware(props PathParmsMiddlewareProps) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 获取比赛信息
		if props.ExtractGame.Enabled {
			gameIDStr := c.Param("game_id")
			gameID, err := strconv.ParseInt(gameIDStr, 10, 64)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{
					"code":    400,
					"message": i18ntool.Translate(c, &i18n.LocalizeConfig{MessageID: "InvalidGameID"}),
				})
				c.Abort()
				return
			}

			c.Set("game_id", gameID)

			if props.ExtractGame.ExtraceModel {
				var game models.Game
				if err := dbtool.DB().Where("game_id = ?", gameID).First(&game).Error; err != nil {
					if err == gorm.ErrRecordNotFound {
						c.JSON(http.StatusNotFound, gin.H{
							"code":    404,
							"message": i18ntool.Translate(c, &i18n.LocalizeConfig{MessageID: "GameNotFound"}),
						})
					} else {
						c.JSON(http.StatusInternalServerError, gin.H{
							"code":    500,
							"message": i18ntool.Translate(c, &i18n.LocalizeConfig{MessageID: "FailedToLoadGames"}),
						})
					}
					c.Abort()
					return
				}

				c.Set("game", game)
			}
		}

		if props.ExtractChallenge.Enabled {
			challengeIDStr := c.Param("challenge_id")
			challengeID, err := strconv.ParseInt(challengeIDStr, 10, 64)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{
					"code":    400,
					"message": i18ntool.Translate(c, &i18n.LocalizeConfig{MessageID: "InvalidChallengeID"}),
				})
				c.Abort()
				return
			}

			c.Set("challenge_id", challengeID)

			if props.ExtractChallenge.ExtraceModel {
				var challenge models.Challenge

				if err := dbtool.DB().Where("challenge_id = ?", challengeID).First(&challenge).Error; err != nil {
					if err == gorm.ErrRecordNotFound {
						c.JSON(http.StatusNotFound, gin.H{
							"code":    404,
							"message": i18ntool.Translate(c, &i18n.LocalizeConfig{MessageID: "ChallengeNotFound"}),
						})
					} else {
						c.JSON(http.StatusInternalServerError, gin.H{
							"code":    500,
							"message": i18ntool.Translate(c, &i18n.LocalizeConfig{MessageID: "FailedToLoadChallenge"}),
						})
					}
					c.Abort()
					return
				}

				c.Set("challenge", challenge)
			}
		}

		if props.ExtractGameChallenge.Enabled {
			gameIDStr := c.Param("game_id")
			gameID, err := strconv.ParseInt(gameIDStr, 10, 64)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{
					"code":    400,
					"message": i18ntool.Translate(c, &i18n.LocalizeConfig{MessageID: "InvalidGameID"}),
				})
				c.Abort()
				return
			}

			c.Set("game_id", gameID)

			challengeIDStr := c.Param("challenge_id")
			challengeID, err := strconv.ParseInt(challengeIDStr, 10, 64)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{
					"code":    400,
					"message": i18ntool.Translate(c, &i18n.LocalizeConfig{MessageID: "InvalidChallengeID"}),
				})
				c.Abort()
				return
			}

			c.Set("game_challenge_id", challengeID)

			if props.ExtractGameChallenge.ExtraceModel {
				var challenge models.GameChallenge

				tx := dbtool.DB().Where("challenge_id = ? AND game_id = ?", challengeID, gameID)

				for _, preload := range props.ExtractGameChallenge.Preloads {
					tx = tx.Preload(preload)
				}

				if err := tx.First(&challenge).Error; err != nil {
					if err == gorm.ErrRecordNotFound {
						c.JSON(http.StatusNotFound, gin.H{
							"code":    404,
							"message": i18ntool.Translate(c, &i18n.LocalizeConfig{MessageID: "ChallengeNotFound"}),
						})
					} else {
						c.JSON(http.StatusInternalServerError, gin.H{
							"code":    500,
							"message": i18ntool.Translate(c, &i18n.LocalizeConfig{MessageID: "FailedToLoadChallenge"}),
						})
					}
					c.Abort()
					return
				}

				c.Set("game_challenge", challenge)
			}
		}

		if props.ExtractTeam.Enabled {
			teamIDStr := c.Param("team_id")
			teamID, err := strconv.ParseInt(teamIDStr, 10, 64)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{
					"code":    400,
					"message": i18ntool.Translate(c, &i18n.LocalizeConfig{MessageID: "InvalidTeamID"}),
				})
				c.Abort()
				return
			}

			c.Set("team_id", teamID)

			if props.ExtractTeam.ExtraceModel {
				var team models.Team

				tx := dbtool.DB().Where("team_id = ?", teamID)

				for _, preload := range props.ExtractTeam.Preloads {
					tx = tx.Preload(preload)
				}

				if err := tx.First(&team).Error; err != nil {
					if err == gorm.ErrRecordNotFound {
						c.JSON(http.StatusNotFound, gin.H{
							"code":    404,
							"message": i18ntool.Translate(c, &i18n.LocalizeConfig{MessageID: "TeamNotFound"}),
						})
					} else {
						c.JSON(http.StatusInternalServerError, gin.H{
							"code":    500,
							"message": i18ntool.Translate(c, &i18n.LocalizeConfig{MessageID: "FailedToLoadTeams"}),
						})
					}
					c.Abort()
					return
				}

				c.Set("team", team)
			}
		}
	}
}

func PathParmsMiddlewareBuilder(mode string) gin.HandlerFunc {

	splited := strings.Split(mode, "|")

	props := PathParmsMiddlewareProps{
		ExtractGame: ExtractOption{
			Enabled:      false,
			ExtraceModel: false,
			Preloads:     make([]string, 0),
		},
		ExtractChallenge: ExtractOption{
			Enabled:      false,
			ExtraceModel: false,
			Preloads:     make([]string, 0),
		},
		ExtractGameChallenge: ExtractOption{
			Enabled:      false,
			ExtraceModel: false,
			Preloads:     make([]string, 0),
		},
		ExtractTeam: ExtractOption{
			Enabled:      false,
			ExtraceModel: false,
			Preloads:     make([]string, 0),
		},
	}

	for _, sp := range splited {

		preloads := make([]string, 0)

		if strings.Contains(sp, "[") {
			// 有 preloads
			pre := sp[strings.Index(sp, "[")+1 : strings.Index(sp, "]")]
			preloads = strings.Split(pre, ",")

			sp = strings.Split(sp, "[")[0]
		}

		if strings.ToLower(sp) == "g" {
			props.ExtractGame.Enabled = true
			props.ExtractGame.ExtraceModel = sp == "G"
		}
		if strings.ToLower(sp) == "gc" {
			props.ExtractGameChallenge.Enabled = true
			props.ExtractGameChallenge.ExtraceModel = sp == "GC"
			props.ExtractGameChallenge.Preloads = preloads
		}
		if strings.ToLower(sp) == "c" {
			props.ExtractChallenge.Enabled = true
			props.ExtractChallenge.ExtraceModel = sp == "C"
		}
		if strings.ToLower(sp) == "t" {
			props.ExtractTeam.Enabled = true
			props.ExtractTeam.ExtraceModel = sp == "T"
			props.ExtractTeam.Preloads = preloads
		}
	}

	return PathParmsMiddleware(props)
}
