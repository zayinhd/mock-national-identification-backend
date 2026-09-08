require("dotenv").config();

const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { loadModels } = require("./services/face.service");
const verificationRoutes = require("./routes/verification.routes");
const registryRoutes = require("./routes/registry.routes");

const app = express();
const uploadsPath = path.join(process.cwd(), "uploads");
const bootTimestamp = Date.now();
let modelsLoaded = false;

app.set("view engine", "ejs");

app.set("views", path.join(process.cwd(), "src", "views"));

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());

app.use((req, res, next) => {
    const requestStart = Date.now();

    res.on("finish", () => {
        const durationMs = Date.now() - requestStart;
        const forwardedFor = req.headers["x-forwarded-for"];
        const ip = forwardedFor || req.ip || "unknown";

        console.log(
            `${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms ip=${ip}`,
        );
    });

    next();
});

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Identity Verification API Running",
    });
});

app.get("/health", (req, res) => {
    const statusCode = modelsLoaded ? 200 : 503;

    return res.status(statusCode).json({
        status: modelsLoaded ? "ok" : "starting",
        modelsLoaded,
        uptimeSeconds: Math.floor((Date.now() - bootTimestamp) / 1000),
        timestamp: new Date().toISOString(),
    });
});

app.use("/registry", registryRoutes);

app.use("/api/verification", verificationRoutes);
app.use("/verification", verificationRoutes);

app.use((req, res) => {
    return res.status(404).json({
        message: "Route not found",
        path: req.originalUrl,
    });
});

async function bootstrap() {
    if (!fs.existsSync(uploadsPath)) {
        fs.mkdirSync(uploadsPath, {
            recursive: true,
        });
    }

    await loadModels();
    modelsLoaded = true;

    app.listen(PORT, () => {
        console.log(`Server running on ${PORT}`);
    });
}

bootstrap().catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
});
