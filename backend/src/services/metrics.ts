import express from "express";
import client from "prom-client";

export const register = new client.Registry();

// HTTP metrics
export const httpDuration = new client.Histogram({
  name: "http_request_duration_ms",
  help: "Duration of HTTP requests in ms",
  labelNames: ["method", "route", "status"],
  buckets: [10, 25, 50, 100, 200, 400, 800, 1600, 3200]
});

export const httpRequests = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"]
});

export const activeConnections = new client.Gauge({
  name: "http_active_connections",
  help: "Number of active HTTP connections"
});

// Cache metrics
export const cacheHits = new client.Counter({
  name: "cache_hits_total",
  help: "Total number of cache hits",
  labelNames: ["cache_key_prefix"]
});

export const cacheMisses = new client.Counter({
  name: "cache_misses_total", 
  help: "Total number of cache misses",
  labelNames: ["cache_key_prefix"]
});

export const cacheOperations = new client.Histogram({
  name: "cache_operation_duration_ms",
  help: "Duration of cache operations in ms",
  labelNames: ["operation", "status"],
  buckets: [1, 5, 10, 25, 50, 100]
});

export const cacheSize = new client.Gauge({
  name: "cache_size_bytes",
  help: "Current cache size in bytes",
  labelNames: ["cache_instance"]
});

// Database metrics
export const dbConnections = new client.Gauge({
  name: "database_connections_active",
  help: "Number of active database connections"
});

export const dbQueryDuration = new client.Histogram({
  name: "database_query_duration_ms",
  help: "Duration of database queries in ms",
  labelNames: ["operation", "table"],
  buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000]
});

export const dbErrors = new client.Counter({
  name: "database_errors_total",
  help: "Total number of database errors",
  labelNames: ["operation", "error_type"]
});

// Business metrics
export const userRegistrations = new client.Counter({
  name: "user_registrations_total",
  help: "Total number of user registrations"
});

export const userLogins = new client.Counter({
  name: "user_logins_total",
  help: "Total number of user logins",
  labelNames: ["method"] // credentials, google
});

export const productViews = new client.Counter({
  name: "product_views_total",
  help: "Total number of product views",
  labelNames: ["product_id"]
});

export const apiErrors = new client.Counter({
  name: "api_errors_total",
  help: "Total number of API errors",
  labelNames: ["endpoint", "error_type", "status"]
});

// System metrics
export const memoryUsage = new client.Gauge({
  name: "process_memory_usage_bytes",
  help: "Process memory usage in bytes",
  labelNames: ["type"] // rss, heapUsed, heapTotal, external
});

export const cpuUsage = new client.Gauge({
  name: "process_cpu_usage_percent",
  help: "Process CPU usage percentage"
});

// Регистрируем все метрики
register.registerMetric(httpDuration);
register.registerMetric(httpRequests);
register.registerMetric(activeConnections);
register.registerMetric(cacheHits);
register.registerMetric(cacheMisses);
register.registerMetric(cacheOperations);
register.registerMetric(cacheSize);
register.registerMetric(dbConnections);
register.registerMetric(dbQueryDuration);
register.registerMetric(dbErrors);
register.registerMetric(userRegistrations);
register.registerMetric(userLogins);
register.registerMetric(productViews);
register.registerMetric(apiErrors);
register.registerMetric(memoryUsage);
register.registerMetric(cpuUsage);

// Collect default Node.js metrics
client.collectDefaultMetrics({ register });

// Collect system metrics periodically
export function collectSystemMetrics() {
  const memStats = process.memoryUsage();
  memoryUsage.set({ type: 'rss' }, memStats.rss);
  memoryUsage.set({ type: 'heapUsed' }, memStats.heapUsed);
  memoryUsage.set({ type: 'heapTotal' }, memStats.heapTotal);
  memoryUsage.set({ type: 'external' }, memStats.external);
  
  // CPU usage (simple calculation)
  const cpuUsed = process.cpuUsage();
  const cpuPercent = (cpuUsed.user + cpuUsed.system) / 1000000; // микросекунды в секунды
  cpuUsage.set(cpuPercent);
}

// Middleware to instrument HTTP metrics
export function httpMetricsMiddleware() {
  return (req: any, res: any, next: any) => {
    const start = Date.now();
    activeConnections.inc();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const route = req.route?.path || req.path || 'unknown';
      const method = req.method;
      const status = res.statusCode.toString();
      
      httpDuration.observe({ method, route, status }, duration);
      httpRequests.inc({ method, route, status });
      activeConnections.dec();
    });
    
    next();
  };
}

export function registerMetrics() {
  // Start system metrics collection every 10 seconds
  setInterval(collectSystemMetrics, 10000);
  collectSystemMetrics(); // Collect initial metrics immediately
}

export function startMetricsServer(port: number) {
  const app = express();
  
  app.get("/metrics", async (_req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  });
  
  app.get("/health", (_req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });
  
  app.listen(port, () => {
    console.log(`🔍 Metrics server at http://localhost:${port}/metrics`);
    console.log(`💓 Health check at http://localhost:${port}/health`);
  });
}

