package monitoring

import (
	"runtime"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

// 系统级 Prometheus 指标
var (
	// CPU 相关指标
	goroutineCount = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "a1ctf_goroutines",
		Help: "Number of goroutines currently running",
	})

	cpuCores = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "a1ctf_cpu_cores",
		Help: "Number of CPU cores available",
	})

	// 内存相关指标
	memoryAlloc = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "a1ctf_memory_alloc_bytes",
		Help: "Bytes of allocated heap objects",
	})

	memorySys = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "a1ctf_memory_sys_bytes",
		Help: "Total bytes of memory obtained from the OS",
	})

	memoryUsagePercent = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "a1ctf_memory_usage_percent",
		Help: "Memory usage percentage",
	})
)

// SystemMonitor 系统监控器
type SystemMonitor struct {
	updateInterval time.Duration
	stopCh         chan bool
}

// NewSystemMonitor 创建新的系统监控器
func NewSystemMonitor(updateInterval time.Duration) *SystemMonitor {
	if updateInterval == 0 {
		updateInterval = 5 * time.Second // 默认5秒更新一次
	}

	return &SystemMonitor{
		updateInterval: updateInterval,
		stopCh:         make(chan bool),
	}
}

// Start 启动系统监控
func (sm *SystemMonitor) Start() {
	// 初始化CPU核心数（这个值不会变）
	cpuCores.Set(float64(runtime.NumCPU()))

	// 启动监控goroutine
	go sm.monitor()
}

// Stop 停止系统监控
func (sm *SystemMonitor) Stop() {
	close(sm.stopCh)
}

// monitor 监控循环
func (sm *SystemMonitor) monitor() {
	ticker := time.NewTicker(sm.updateInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			sm.updateMetrics()
		case <-sm.stopCh:
			return
		}
	}
}

// updateMetrics 更新所有指标
func (sm *SystemMonitor) updateMetrics() {
	var memStats runtime.MemStats
	runtime.ReadMemStats(&memStats)

	// 更新CPU指标
	goroutineCount.Set(float64(runtime.NumGoroutine()))

	// 更新内存指标
	memoryAlloc.Set(float64(memStats.Alloc))
	memorySys.Set(float64(memStats.Sys))

	// 计算内存使用率
	var usagePercent float64
	if memStats.Sys > 0 {
		usagePercent = float64(memStats.Alloc) / float64(memStats.Sys) * 100
	}
	memoryUsagePercent.Set(usagePercent)
}

// GetMemoryUsagePercent 获取内存使用百分比
func (sm *SystemMonitor) GetMemoryUsagePercent() float64 {
	var memStats runtime.MemStats
	runtime.ReadMemStats(&memStats)

	if memStats.Sys == 0 {
		return 0
	}

	return float64(memStats.Alloc) / float64(memStats.Sys) * 100
}

// GetSystemStats 获取系统统计信息
func (sm *SystemMonitor) GetSystemStats() map[string]interface{} {
	var memStats runtime.MemStats
	runtime.ReadMemStats(&memStats)

	return map[string]interface{}{
		"cpu_cores":            runtime.NumCPU(),
		"goroutines":           runtime.NumGoroutine(),
		"memory_alloc_bytes":   memStats.Alloc,
		"memory_sys_bytes":     memStats.Sys,
		"memory_usage_percent": sm.GetMemoryUsagePercent(),
	}
}
