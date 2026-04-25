const dotenv = require("dotenv").config();
const express = require("express");
const pg = require("pg");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cookieParser()); // ✅ fixed

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(bodyParser.json());

app.use( // ✅ fixed (was unsubscribe)
    cors({
        origin: ["http://localhost:3000", "Domain URL"],
        credentials: true,
    })
);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("Home Pages");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});