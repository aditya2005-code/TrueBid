import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import rfqRoutes from "./routes/rfq.routes.js";
import bidRoutes from "./routes/bid.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(
    cors({
        origin: ["http://localhost:3000", "Domain URL"],
        credentials: true,
    })
);

app.use("/api/rfqs", rfqRoutes);
app.use("/api/bids", bidRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("Home Pages");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});