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

async function bootstrap() {
    if (!fs.existsSync(uploadsPath)) {
        fs.mkdirSync(uploadsPath, {
            recursive: true,
        });
    }

    await loadModels();

    app.listen(PORT, () => {
        console.log(`Server running on ${PORT}`);
    });
}

bootstrap().catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
});
