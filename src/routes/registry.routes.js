const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload.middleware");

const {
    renderRegistryPage,
    createCitizen,
} = require("../controllers/registry.controller");

router.get("/", renderRegistryPage);

router.post("/create", upload.single("photo"), createCitizen);

module.exports = router;
