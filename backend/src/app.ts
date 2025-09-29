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

// Регистрируем сбор метрик
registerMetrics();

app.use(helmet());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Добавляем middleware для метрик HTTP запросов
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

