import express from "express";
import cors from "cors";

import router from "./routes/auth.routes";
import ticketRoutes from "./routes/ticket.routes";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173"
    ],
    credentials: true
  })
);

app.use(express.json());

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", router);
app.use("/api/tickets", ticketRoutes);

export default app;