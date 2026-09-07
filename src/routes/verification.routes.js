const express = require("express");

const upload = require("../middleware/upload.middleware");

const { verifyIdentity } = require("../controllers/verification.controller");

const router = express.Router();

console.log(require.resolve("../middleware/upload.middleware"));

console.log(upload);
console.log("route pass");
console.log(typeof upload);

router.post("/verify", upload.single("selfie"), verifyIdentity);

module.exports = router;
