import express from "express"
import router from "./routes/auth.routes";
import ticketRoutes from "./routes/ticket.routes";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger";


const app = express();

app.use(express.json());

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", router);
app.use("/api/tickets", ticketRoutes);

export default app;

