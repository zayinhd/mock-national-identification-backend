const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

require("dotenv").config();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Identity Verification API Running",
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
