package monitoring

import (
	"reflect"
	"strings"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"gorm.io/gorm"
)

// Prometheus 指标
var (
	// SQL 执行时间直方图
	sqlDuration = promauto.NewHistogramVec(prometheus.HistogramOpts{
		Name:    "gorm_sql_duration_seconds",
		Help:    "SQL execution duration in seconds",
		Buckets: []float64{0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5},
	}, []string{"operation", "table", "status"})

	// SQL 执行计数
	sqlCounter = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "gorm_sql_total",
		Help: "Total number of SQL executions",
	}, []string{"operation", "table", "status"})

	// 慢查询计数
	slowQueryCounter = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "gorm_slow_queries_total",
		Help: "Total number of slow queries",
	}, []string{"operation", "table"})

	// 连接池指标
	dbConnections = promauto.NewGaugeVec(prometheus.GaugeOpts{
		Name: "gorm_db_connections",
		Help: "Database connections",
	}, []string{"status"})
)

// PrometheusPlugin GORM Prometheus 插件
type PrometheusPlugin struct {
	SlowThreshold time.Duration
}

func (p *PrometheusPlugin) Name() string {
	return "prometheus"
}

func (p *PrometheusPlugin) Initialize(db *gorm.DB) error {
	// 注册回调
	db.Callback().Create().Before("gorm:create").Register("prometheus:before", p.before)
	db.Callback().Create().After("gorm:create").Register("prometheus:after", p.after)

	db.Callback().Query().Before("gorm:query").Register("prometheus:before", p.before)
	db.Callback().Query().After("gorm:query").Register("prometheus:after", p.after)

	db.Callback().Update().Before("gorm:update").Register("prometheus:before", p.before)
	db.Callback().Update().After("gorm:update").Register("prometheus:after", p.after)

	db.Callback().Delete().Before("gorm:delete").Register("prometheus:before", p.before)
	db.Callback().Delete().After("gorm:delete").Register("prometheus:after", p.after)

	db.Callback().Row().Before("gorm:row").Register("prometheus:before", p.before)
	db.Callback().Row().After("gorm:row").Register("prometheus:after", p.after)

	db.Callback().Raw().Before("gorm:raw").Register("prometheus:before", p.before)
	db.Callback().Raw().After("gorm:raw").Register("prometheus:after", p.after)

	// 启动连接池监控
	go p.monitorConnections(db)

	return nil
}

func (p *PrometheusPlugin) before(db *gorm.DB) {
	db.InstanceSet("prometheus:start_time", time.Now())
}

func (p *PrometheusPlugin) after(db *gorm.DB) {
	startTime, exists := db.InstanceGet("prometheus:start_time")
	if !exists {
		return
	}

	start := startTime.(time.Time)
	duration := time.Since(start)

	// 获取操作类型和表名
	operation := p.getOperation(db)
	table := p.getTableName(db)
	status := p.getStatus(db)

	// 记录指标
	sqlDuration.WithLabelValues(operation, table, status).Observe(duration.Seconds())
	sqlCounter.WithLabelValues(operation, table, status).Inc()

	// 慢查询检测
	if duration > p.SlowThreshold {
		slowQueryCounter.WithLabelValues(operation, table).Inc()
	}
}

func (p *PrometheusPlugin) getOperation(db *gorm.DB) string {
	// 首先检查 SQL 语句
	sql := strings.ToLower(strings.TrimSpace(db.Statement.SQL.String()))
	if sql != "" {
		switch {
		case strings.HasPrefix(sql, "select"):
			return "select"
		case strings.HasPrefix(sql, "insert"):
			return "insert"
		case strings.HasPrefix(sql, "update"):
			return "update"
		case strings.HasPrefix(sql, "delete"):
			return "delete"
		default:
			return "other"
		}
	}

	// 如果没有 SQL 语句，尝试从 Schema 推断
	if db.Statement.Schema != nil {
		// 检查反射值的类型
		if db.Statement.ReflectValue.IsValid() {
			switch db.Statement.ReflectValue.Kind() {
			case reflect.Slice, reflect.Array:
				return "select"
			case reflect.Struct, reflect.Ptr:
				// 只有在处理结构体或指针时才调用 Changed()
				// 使用 defer + recover 来安全地调用 Changed()
				func() {
					defer func() {
						if r := recover(); r != nil {
							// 如果 Changed() 出现 panic，忽略
						}
					}()
					if db.Statement.Changed() {
						return
					}
				}()
				// 这里可以安全地调用 Changed()
				if p.safeChanged(db) {
					return "update"
				}
				return "select"
			default:
				return "select"
			}
		}
	}

	return "other"
}

// safeChanged 安全地调用 Changed() 方法
func (p *PrometheusPlugin) safeChanged(db *gorm.DB) bool {
	defer func() {
		if r := recover(); r != nil {
			// 如果发生 panic，返回 false
		}
	}()
	return db.Statement.Changed()
}

func (p *PrometheusPlugin) getTableName(db *gorm.DB) string {
	if db.Statement.Schema != nil {
		return db.Statement.Schema.Table
	}
	return "unknown"
}

func (p *PrometheusPlugin) getStatus(db *gorm.DB) string {
	if db.Error != nil {
		return "error"
	}
	return "success"
}

func (p *PrometheusPlugin) monitorConnections(db *gorm.DB) {
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		sqlDB, err := db.DB()
		if err != nil {
			continue
		}

		stats := sqlDB.Stats()
		dbConnections.WithLabelValues("open").Set(float64(stats.OpenConnections))
		dbConnections.WithLabelValues("idle").Set(float64(stats.Idle))
		dbConnections.WithLabelValues("in_use").Set(float64(stats.InUse))
	}
}
