import express from "express"
import router from "./routes/auth.routes";
import ticketRoutes from "./routes/ticket.routes";


const app = express();

app.use(express.json());

app.use("/api/auth", router);
app.use("/api/tickets", ticketRoutes);

export default app;

