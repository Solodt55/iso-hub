import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerConsolidatedRoutes } from "./consolidated-routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeDatabase } from "./db";
import { performanceService } from "./services/performance-service";

const app = express();

// CORS configuration for cross-origin requests
app.use((req, res, next) => {
  // Allow requests from ISO-Hub and other origins
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:3000',
    'http://localhost:5000',
    'https://your-production-domain.com' // Add your production domain
  ];
  
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Cookie');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Enable performance tracking
app.use(performanceService.trackPerformance());

// Serve static files from public directory with caching
app.use(express.static('public', {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Initialize database connection and health check
    log("Initializing database connection...");
    
    const dbHealthy = await initializeDatabase();
    if (!dbHealthy) {
      throw new Error("Database initialization failed");
    }
    
    // Register consolidated routes
    const server = await registerConsolidatedRoutes(app);

    // Enhanced health check endpoint with performance metrics
    app.get('/health', (req, res) => {
      const health = performanceService.getHealthStatus();
      res.json({ 
        status: health.status, 
        timestamp: new Date().toISOString(),
        performance: {
          avgResponseTime: health.avgResponseTime,
          memoryUsage: health.memoryUsage,
          slowEndpoints: health.slowEndpoints
        }
      });
    });

    // Performance metrics endpoint
    app.get('/api/admin/performance/metrics', (req, res) => {
      res.json({
        health: performanceService.getHealthStatus(),
        memory: performanceService.getCurrentMemoryUsage(),
        slowEndpoints: performanceService.getSlowEndpoints(),
        avgResponseTime: performanceService.getAverageResponseTime()
      });
    });

    // Setup frontend serving based on environment with fallback
    if (process.env.NODE_ENV === 'production') {
      try {
        // Try to serve static files in production
        serveStatic(app);
        log("Production mode: serving static files from dist directory");
      } catch (error) {
        // Fallback to Vite middleware if static files aren't available
        log("Static files not found, using Vite middleware fallback");
        await setupVite(app, server);
      }
    } else {
      // Development mode always uses Vite middleware
      await setupVite(app, server);
      log("Development mode: using Vite middleware");
    }

    // API fallback middleware - ensure unmatched API routes return 404 JSON instead of HTML
    app.use('/api/*', (req: Request, res: Response) => {
      res.status(404).json({ 
        error: 'API endpoint not found',
        path: req.originalUrl,
        method: req.method
      });
    });

    // Global error handler - placed after Vite setup to catch all errors
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      
      log(`Error: ${status} - ${message}`);
      res.status(status).json({ message });
      
      // Don't throw the error to prevent server crash
      if (status >= 500) {
        console.error('Server error:', err);
      }
    });

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    server.listen({
      port,
      host: "localhost",
    }, () => {
      log(`Server successfully started on port ${port}`);
      log(`Health check available at http://localhost:${port}/health`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        log('Process terminated');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
