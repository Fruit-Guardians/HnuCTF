package redistool

import (
	"github.com/go-redis/redis"
	"github.com/spf13/viper"
)

var RedisClient *redis.Client

func ConnectToRedis() {
	redisAddr := viper.GetString("redis.address")
	redisPassword := viper.GetString("redis.password")

	redisOpt := &redis.Options{
		Addr:     redisAddr,
		Password: redisPassword,
		DB:       1,
	}

	RedisClient = redis.NewClient(redisOpt)
}
