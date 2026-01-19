package zaphelper

import (
	"compress/gzip"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/fatih/color"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var Logger *zap.Logger
var Sugar *zap.SugaredLogger
var FileLogger *zap.Logger

func coloredLevelEncoder(level zapcore.Level, enc zapcore.PrimitiveArrayEncoder) {
	switch level {
	case zapcore.DebugLevel:
		enc.AppendString(color.CyanString(level.String()))
	case zapcore.InfoLevel:
		enc.AppendString(color.GreenString(level.String()))
	case zapcore.WarnLevel:
		enc.AppendString(color.YellowString(level.String()))
	case zapcore.ErrorLevel:
		enc.AppendString(color.RedString(level.String()))
	default:
		enc.AppendString(level.String())
	}
}

func getConsoleCore() zapcore.Core {
	// 控制台编码器配置
	consoleEncoderConfig := zap.NewDevelopmentEncoderConfig()
	consoleEncoderConfig.EncodeLevel = coloredLevelEncoder       // 控制台带颜色
	consoleEncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder // 可读的时间格式

	// 控制台输出
	consoleEncoder := zapcore.NewConsoleEncoder(consoleEncoderConfig)
	consoleWriter := zapcore.Lock(os.Stdout) // 线程安全的 stdout 输出

	// 控制台日志级别
	consoleLevel := zap.LevelEnablerFunc(func(lvl zapcore.Level) bool {
		return lvl >= zapcore.DebugLevel // 控制台输出所有级别
	})

	return zapcore.NewCore(consoleEncoder, consoleWriter, consoleLevel)
}

func getFileCore() zapcore.Core {
	// 创建或打开日志文件

	dailyWriter := newDailyRotateWriter("./data/logs", "a1ctf_", ".log")

	// JSON 编码器配置
	fileEncoderConfig := zap.NewProductionEncoderConfig()
	fileEncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder

	// 文件输出
	fileEncoder := zapcore.NewJSONEncoder(fileEncoderConfig)
	fileWriter := zapcore.AddSync(dailyWriter)

	// 文件日志级别
	fileLevel := zap.LevelEnablerFunc(func(lvl zapcore.Level) bool {
		return lvl >= zapcore.InfoLevel // 文件只记录 Info 及以上级别
	})

	return zapcore.NewCore(fileEncoder, fileWriter, fileLevel)
}

func CompressAndDeleteOldLogs() error {

	dir := "./data/logs"
	prefix := "a1ctf_"
	suffix := ".log"

	// 获取当前日期(不包含时间部分)
	today := time.Now().Format("2006-01-02")
	todayStart, _ := time.Parse("2006-01-02", today)

	// 遍历日志目录
	err := filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// 跳过目录和非匹配文件
		if info.IsDir() {
			return nil
		}

		filename := info.Name()

		// 检查文件前缀和后缀
		if prefix != "" && !strings.HasPrefix(filename, prefix) {
			return nil
		}
		if suffix != "" && !strings.HasSuffix(filename, suffix) {
			return nil
		}

		// 跳过已经是压缩文件(.gz)的文件
		if strings.HasSuffix(filename, ".gz") {
			return nil
		}

		dataTime := strings.Split(strings.TrimSuffix(filename, ".log"), "_")[1]

		dataTimeStart, _ := time.Parse("2006-01-02", dataTime)
		if dataTimeStart.After(todayStart) || dataTimeStart.Equal(todayStart) {
			// 今天的文件不处理
			return nil
		}

		// 压缩文件
		if err := compressFile(path); err != nil {
			return fmt.Errorf("failed to compress %s: %v", path, err)
		}

		// 删除原文件
		if err := os.Remove(path); err != nil {
			return fmt.Errorf("failed to remove %s: %v", path, err)
		}

		return nil
	})

	return err
}

func compressFile(srcPath string) error {
	// 打开原始文件
	srcFile, err := os.Open(srcPath)
	if err != nil {
		return err
	}
	defer srcFile.Close()

	// 创建目标.gz文件
	dstFile, err := os.Create(srcPath + ".gz")
	if err != nil {
		return err
	}
	defer dstFile.Close()

	// 创建gzip writer
	gzWriter := gzip.NewWriter(dstFile)
	defer gzWriter.Close()

	// 设置gzip头信息
	gzWriter.Name = filepath.Base(srcPath)
	gzWriter.ModTime = time.Now()

	// 复制文件内容
	if _, err := io.Copy(gzWriter, srcFile); err != nil {
		return err
	}

	return nil
}

func InitZap() {

	consoleCore := getConsoleCore()
	fileCore := getFileCore()

	// 使用 NewTee 将多个核心组合在一起
	core := zapcore.NewTee(consoleCore, fileCore)

	tmpLogger := zap.New(core, zap.AddCaller())

	Logger = tmpLogger
	Sugar = tmpLogger.Sugar()

	FileLogger = zap.New(fileCore)
}

func CloseZap() {
	Sugar.Sync()
}
