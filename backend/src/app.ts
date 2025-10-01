import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import waitlistSignupRoutes from "./routes/waitlist-signup";
import wishlistRoutes from "./routes/wishlist";
import meRoutes from "./routes/me";
import googleOAuth from "./oauth/google";
import { errorHandler } from "./middleware/error";
import { httpMetricsMiddleware, registerMetrics } from "./services/metrics";

const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Register metrics collection
registerMetrics();

app.use(helmet());
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      return allowedOrigins.includes(origin)
        ? callback(null, true)
        : callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(express.json());

// Add middleware to instrument HTTP metrics
app.use(httpMetricsMiddleware());

app.use(morgan("tiny"));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/waitlist", waitlistSignupRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/me", meRoutes);
app.use("/api/auth", googleOAuth);

app.use(errorHandler);
export default app;

