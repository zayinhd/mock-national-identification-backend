require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { loadModels } = require("./services/face.service");
const verificationRoutes = require("./routes/verification.routes");
const registryRoutes = require("./routes/registry.routes");

const app = express();

app.set("view engine", "ejs");

app.set("views", path.join(process.cwd(), "src", "views"));

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

console.log(verificationRoutes);

app.use("/registry", registryRoutes);

app.use("/api/verification", verificationRoutes);

(async () => {
    await loadModels();
})();

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});
