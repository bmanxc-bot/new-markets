import express from "express";
import marketRouter from "../market (2)";

/**
 * This serverless function wraps the Express router defined in `market (2).ts`
 * and exposes it under the `/api/market` path on Vercel. By mounting the
 * router at the root (`/`), the defined routes such as `/market/snapshot`
 * and `/market/news` become available as `/api/market/snapshot` and
 * `/api/market/news` when deployed on Vercel.
 */
const app = express();
app.use(express.json());
app.use(marketRouter);

export default app;
