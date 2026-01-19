package zaphelper

import (
	"go.uber.org/zap"
)

type ZapLogger struct {
	logger *zap.Logger
}

func NewZapLogger(zapLogger *zap.Logger) *ZapLogger {
	return &ZapLogger{logger: zapLogger}
}

func (l *ZapLogger) Debug(args ...interface{}) {
	l.logger.Debug("asynq", zap.Any("details", args))
}

func (l *ZapLogger) Info(args ...interface{}) {
	l.logger.Info("asynq", zap.Any("details", args))
}

func (l *ZapLogger) Warn(args ...interface{}) {
	l.logger.Warn("asynq", zap.Any("details", args))
}

func (l *ZapLogger) Error(args ...interface{}) {
	l.logger.Error("asynq", zap.Any("details", args))
}

func (l *ZapLogger) Fatal(args ...interface{}) {
	l.logger.Fatal("asynq", zap.Any("details", args))
}
