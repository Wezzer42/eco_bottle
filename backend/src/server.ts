import "dotenv/config";
import { createServer } from "http";
import app from "./app";
import { registerMetrics, startMetricsServer } from "./services/metrics";

const port = Number(process.env.PORT || 4000);
const promPort = Number(process.env.PROM_PORT || 9001);

registerMetrics();
startMetricsServer(promPort);

const server = createServer(app);
server.listen(port, () => {
  console.log(`API listening on ${port}`);
});

