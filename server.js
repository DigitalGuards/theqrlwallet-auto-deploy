const express = require("express");
const crypto = require("crypto");
const { exec } = require("child_process");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT;
const SECRET = process.env.SECRET;

app.use(express.json());

function verifySignature(req, res, buf) {
    const signature = req.headers["x-hub-signature-256"];
    if (!signature) {
        return res.status(401).send("Signature missing");
    }
    const hmac = crypto.createHmac("sha256", SECRET);
    hmac.update(buf);
    const digest = `sha256=${hmac.digest("hex")}`;
    if (signature !== digest) {
        return res.status(401).send("Invalid signature");
    }
}

app.post("/frontend-webhook", express.json({ verify: verifySignature }), (req, res) => {
    const event = req.headers["x-github-event"];
    const payload = req.body;

    console.log(`Received event: ${event}`);

    if (event === "push" && payload.ref === "refs/heads/main") {
        console.log("Code pushed to main branch. Triggering deployment...");

        exec("./deploy-frontend-prod.sh", (err, stdout, stderr) => {
            if (err) {
                console.error(`Error executing deployment: ${err}`);
                return res.status(500).send("Deployment failed");
            }
            console.log(`Deployment output:\n${stdout}`);
            res.send("Deployment successful");
        });
    } else if (event === "push" && payload.ref === "refs/heads/dev") {
        console.log("Code pushed to dev branch. Triggering deployment...");
        exec("./deploy-frontend-dev.sh", (err, stdout, stderr) => {
            if (err) {
                console.error(`Error executing deployment: ${err}`);
                return res.status(500).send("Deployment failed");
            }
            console.log(`Deployment output:\n${stdout}`);
            res.send("Deployment successful");
        });
    } else {
        res.send("Event received, but no action taken.");
    }
});

app.post("/backend-webhook", express.json({ verify: verifySignature }), (req, res) => {
    const event = req.headers["x-github-event"];
    const payload = req.body;

    console.log(`Received event: ${event}`);

    if (event === "push" && payload.ref === "refs/heads/main") {
        console.log("Code pushed to main branch. Triggering deployment...");

        exec("./deploy-backend-prod.sh", (err, stdout, stderr) => {
            if (err) {
                console.error(`Error executing deployment: ${err}`);
                return res.status(500).send("Deployment failed");
            }
            console.log(`Deployment output:\n${stdout}`);
            res.send("Deployment successful");
        });
    } else if (event === "push" && payload.ref === "refs/heads/dev") {
        console.log("Code pushed to dev branch. Triggering deployment...");
        exec("./deploy-backend-dev.sh", (err, stdout, stderr) => {
            if (err) {
                console.error(`Error executing deployment: ${err}`);
                return res.status(500).send("Deployment failed");
            }
            console.log(`Deployment output:\n${stdout}`);
            res.send("Deployment successful");
        });
    } else {
        res.send("Event received, but no action taken.");
    }
});

app.listen(PORT, () => {
    console.log(`Webhook listener running on port ${PORT}`);
});
