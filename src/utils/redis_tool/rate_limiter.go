package redistool

import (
	"a1ctf/src/utils/zaphelper"
	"time"

	"go.uber.org/zap"
)

func LockForATime(operationName string, lockTime time.Duration) bool {
	set, err := RedisClient.SetNX(operationName, "locked", lockTime).Result()
	if err != nil {
		zaphelper.Logger.Error("LockForATime failed", zap.Error(err), zap.String("operationName", operationName))
		return false
	}
	return set
}

func SetValueForATime(key string, value string, lockTime time.Duration) bool {
	_, err := RedisClient.Set(key, value, lockTime).Result()
	if err != nil {
		zaphelper.Logger.Error("SetValueForATime failed", zap.Error(err), zap.String("operationName", key))
		return false
	}
	return true
}

func GetValue(key string) (string, error) {
	return RedisClient.Get(key).Result()
}

func UnsetValue(key string) error {
	return RedisClient.Del(key).Err()
}
