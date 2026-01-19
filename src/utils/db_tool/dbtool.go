package dbtool

import (
	"a1ctf/src/modules/monitoring"
	"context"
	"fmt"
	"log"
	"os"
	"strconv"
	"sync"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/go-redis/redis"
	"github.com/olahol/melody"
	"github.com/spf13/viper"
)

var db *gorm.DB
var redis_instance *redis.Client
var ml *melody.Melody
var gameSessions map[*melody.Session]int64 = make(map[*melody.Session]int64)
var gameSessionsMutex sync.RWMutex
var ctx = context.Background()

func DB() *gorm.DB {
	return db
}

func Melody() *melody.Melody {
	return ml
}

func Redis() *redis.Client {
	return redis_instance
}

func Context() context.Context {
	return ctx
}

func Init() {

	// Init DB

	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags), // io writer
		logger.Config{
			SlowThreshold:             time.Second,   // Slow SQL threshold
			LogLevel:                  logger.Silent, // Log level
			IgnoreRecordNotFoundError: true,          // Ignore ErrRecordNotFound error for logger
			ParameterizedQueries:      true,          // Don't include params in the SQL log
			Colorful:                  false,         // Disable color
		},
	)

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
		viper.GetString("postgres.host"),
		viper.GetString("postgres.user"),
		viper.GetString("postgres.password"),
		viper.GetString("postgres.dbname"),
		viper.GetString("postgres.port"),
		viper.GetString("postgres.sslmode"))
	db_local, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger:         newLogger, // 设置自定义 Logger
		TranslateError: true,
	})
	if err != nil {
		panic(err)
	}

	if viper.GetBool("monitoring.enabled") {
		prometheusPlugin := &monitoring.PrometheusPlugin{
			SlowThreshold: viper.GetDuration("monitoring.gorm-slow-query-threshold"), // 慢查询阈值
		}

		if err := db_local.Use(prometheusPlugin); err != nil {
			panic(err)
		}
	}

	db = db_local

	// Init melody
	ml = melody.New()

	gameSessions = make(map[*melody.Session]int64)

	ml.HandleConnect(func(s *melody.Session) {
		// 从会话keys中获取gameID
		gameIDStr, exists := s.Get("gameID")
		if !exists {
			s.Close()
			return
		}

		gameID, err := strconv.ParseInt(gameIDStr.(string), 10, 64)
		if err != nil {
			s.Close()
			return
		}

		gameSessionsMutex.Lock()
		gameSessions[s] = gameID
		gameSessionsMutex.Unlock()

		s.Write([]byte("{ \"status\": \"connected\" }"))
	})

	ml.HandleClose(func(s *melody.Session, i int, s2 string) error {
		gameSessionsMutex.Lock()
		_, exists := gameSessions[s]
		if exists {
			delete(gameSessions, s)
		}
		gameSessionsMutex.Unlock()
		return nil
	})
}

func GameSessions() map[*melody.Session]int64 {
	gameSessionsMutex.RLock()
	defer gameSessionsMutex.RUnlock()

	// 返回一个拷贝以避免外部修改
	result := make(map[*melody.Session]int64)
	for k, v := range gameSessions {
		result[k] = v
	}
	return result
}
