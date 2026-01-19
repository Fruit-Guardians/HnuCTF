package ratelimiter

import (
	"fmt"
	"net/http"
	"sync"
	"time"

	jwtauth "a1ctf/src/modules/jwt_auth"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

func RateLimiter(rateLimit int, tokenInterval time.Duration) gin.HandlerFunc {
	type limiterInfo struct {
		limiter  *rate.Limiter
		lastUsed time.Time
	}

	limiters := sync.Map{}

	// 定期清理不活跃的限速器（可选）
	go func() {
		ticker := time.NewTicker(time.Hour)
		defer ticker.Stop()

		for range ticker.C {
			now := time.Now()
			limiters.Range(func(key, value interface{}) bool {
				info := value.(*limiterInfo)
				if now.Sub(info.lastUsed) > time.Hour {
					limiters.Delete(key)
				}
				return true
			})
		}
	}()

	return func(c *gin.Context) {
		var identifier string

		// 尝试从JWT获取用户ID
		claims, errFromJwt := jwtauth.GetJwtMiddleWare().GetClaimsFromJWT(c)
		if errFromJwt == nil {
			if userID, userIDExists := claims["UserID"]; userIDExists {
				identifier = fmt.Sprintf("user_%v", userID)
			}
		}

		// 如果没有用户ID，使用客户端IP
		if identifier == "" {
			identifier = fmt.Sprintf("ip_%s", c.ClientIP())
		}

		// 获取或创建该标识符的限速器
		now := time.Now()
		limiterInterface, _ := limiters.LoadOrStore(identifier, &limiterInfo{
			limiter:  rate.NewLimiter(rate.Every(tokenInterval), rateLimit),
			lastUsed: now,
		})
		info := limiterInterface.(*limiterInfo)
		info.lastUsed = now

		if !info.limiter.Allow() {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"message": "Too many requests, please try again later",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
