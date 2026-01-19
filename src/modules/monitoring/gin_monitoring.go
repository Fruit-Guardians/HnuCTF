package monitoring

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

// Prometheus指标定义
var (
	// HTTP请求总数
	httpRequestsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "gin_http_requests_total",
			Help: "Total number of HTTP requests",
		},
		[]string{"method", "endpoint", "status_code"},
	)

	// HTTP请求持续时间
	httpRequestDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name: "gin_http_request_duration_seconds",
			Help: "HTTP request duration in seconds",
			Buckets: []float64{
				0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10,
			},
		},
		[]string{"method", "endpoint", "status_code"},
	)

	// HTTP请求大小
	httpRequestSize = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "gin_http_request_size_bytes",
			Help:    "HTTP request size in bytes",
			Buckets: prometheus.ExponentialBuckets(100, 10, 8),
		},
		[]string{"method", "endpoint"},
	)

	// HTTP响应大小
	httpResponseSize = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "gin_http_response_size_bytes",
			Help:    "HTTP response size in bytes",
			Buckets: prometheus.ExponentialBuckets(100, 10, 8),
		},
		[]string{"method", "endpoint", "status_code"},
	)

	// 当前活跃连接数
	httpActiveConnections = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "gin_http_active_connections",
			Help: "Current number of active HTTP connections",
		},
	)

	// 请求处理中数量
	httpInFlightRequests = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "gin_http_in_flight_requests",
			Help: "Current number of requests being processed",
		},
	)

	// 4xx错误计数
	httpClientErrors = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "gin_http_client_errors_total",
			Help: "Total number of 4xx client errors",
		},
		[]string{"method", "endpoint", "status_code"},
	)

	// 5xx错误计数
	httpServerErrors = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "gin_http_server_errors_total",
			Help: "Total number of 5xx server errors",
		},
		[]string{"method", "endpoint", "status_code"},
	)
)

// GinPrometheusMiddleware Gin的Prometheus中间件
func GinPrometheusMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		// 跳过metrics端点本身
		if c.Request.URL.Path == "/metrics" {
			c.Next()
			return
		}

		start := time.Now()

		// 增加活跃请求计数
		httpInFlightRequests.Inc()
		httpActiveConnections.Inc()

		// 记录请求大小
		// requestSize := computeApproximateRequestSize(c.Request)

		// 处理请求
		c.Next()

		// 计算响应时间
		duration := time.Since(start)
		statusCode := c.Writer.Status()
		method := c.Request.Method
		endpoint := c.FullPath()

		// 如果endpoint为空，使用URL路径
		if endpoint == "" {
			endpoint = c.Request.URL.Path
		}

		statusCodeStr := strconv.Itoa(statusCode)

		// 记录基础指标
		httpRequestsTotal.WithLabelValues(method, endpoint, statusCodeStr).Inc()
		httpRequestDuration.WithLabelValues(method, endpoint, statusCodeStr).Observe(duration.Seconds())
		// httpRequestSize.WithLabelValues(method, endpoint).Observe(float64(requestSize))

		// 记录响应大小
		// responseSize := c.Writer.Size()
		// if responseSize > 0 {
		// 	httpResponseSize.WithLabelValues(method, endpoint, statusCodeStr).Observe(float64(responseSize))
		// }

		// 记录错误
		if statusCode >= 400 && statusCode < 500 {
			httpClientErrors.WithLabelValues(method, endpoint, statusCodeStr).Inc()
		} else if statusCode >= 500 {
			httpServerErrors.WithLabelValues(method, endpoint, statusCodeStr).Inc()
		}

		// 减少活跃请求计数
		httpInFlightRequests.Dec()
		httpActiveConnections.Dec()
	})
}

// 计算请求大小的近似值
func computeApproximateRequestSize(r *http.Request) int {
	size := 0
	if r.URL != nil {
		size += len(r.URL.Path)
	}

	size += len(r.Method)
	size += len(r.Proto)

	for name, values := range r.Header {
		size += len(name)
		for _, value := range values {
			size += len(value)
		}
	}
	size += len(r.Host)

	if r.ContentLength != -1 {
		size += int(r.ContentLength)
	}
	return size
}

// GetPrometheusHandler 返回Prometheus metrics处理器
func GetPrometheusHandler() gin.HandlerFunc {
	handler := promhttp.Handler()
	return gin.WrapH(handler)
}
