package zaphelper

import (
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"
)

type dailyRotateWriter struct {
	mu       sync.Mutex
	file     *os.File
	filePath string
	prefix   string
	suffix   string
	// lastDate 记录上一次写入时的完整日期（yyyy-mm-dd），避免跨月但同日期数字相同导致无法切换
	lastDate string
}

func newDailyRotateWriter(dir, prefix, suffix string) *dailyRotateWriter {
	if err := os.MkdirAll(dir, 0755); err != nil {
		panic(err)
	}

	w := &dailyRotateWriter{
		filePath: dir,
		prefix:   prefix,
		suffix:   suffix,
		lastDate: time.Now().Format("2006-01-02"),
	}

	w.rotateIfNeeded()
	return w
}

func (w *dailyRotateWriter) Write(p []byte) (n int, err error) {
	w.mu.Lock()
	defer w.mu.Unlock()

	if err := w.rotateIfNeeded(); err != nil {
		return 0, err
	}

	return w.file.Write(p)
}

func (w *dailyRotateWriter) Sync() error {
	w.mu.Lock()
	defer w.mu.Unlock()

	if w.file != nil {
		return w.file.Sync()
	}
	return nil
}

func (w *dailyRotateWriter) Close() error {
	w.mu.Lock()
	defer w.mu.Unlock()

	if w.file != nil {
		return w.file.Close()
	}
	return nil
}

func (w *dailyRotateWriter) rotateIfNeeded() error {
	now := time.Now()
	currentDate := now.Format("2006-01-02")

	// 如果日期未变化且文件已存在，则不需要切换
	if currentDate == w.lastDate && w.file != nil {
		return nil
	}

	// 关闭旧文件
	if w.file != nil {
		_ = w.file.Close()
	}

	// 创建新文件
	w.lastDate = currentDate
	logFile := filepath.Join(w.filePath, fmt.Sprintf("%s%s%s", w.prefix, now.Format("2006-01-02"), w.suffix))

	var err error
	w.file, err = os.OpenFile(logFile, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return err
	}

	return nil
}
