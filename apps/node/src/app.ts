import express from 'express';
import type { ErrorRequestHandler, Request, Response } from 'express';
import { parseIPv4, randomIP, randomSuffix } from "./ip.ts";
import { cidrChoices } from "./choice.ts";

const DEFAULT_BASE = "192.168.1.1";
const DEFAULT_SUFFIX = 30;
// Integer 1-32 with no sign, spaces, leading zeros or decimals.
const SUFFIX_RE = /^(?:[1-9]|[12]\d|3[0-2])$/;

const app = express();
const allowedOrigins = new Set([
    "https://cidr-game.bureauofsidequests.com",
    "http://localhost:5155",
    "http://localhost:5173",
]);

app.use((req, res, next) => {
    const origin = req.get("Origin");
    if (origin !== undefined && allowedOrigins.has(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Vary", "Origin");
        res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }
    if (req.method === "OPTIONS") {
        res.sendStatus(204);
        return;
    }
    next();
});

app.get("/healthz", (_, res: Response) => {
    res.sendStatus(200);
});

app.get("/api/new_ip", (_, res: Response) => {
    res.json({
        ip: randomIP(),
        suffix: randomSuffix()
    });
});

app.get("/api/generate", (req: Request, res: Response) => {
    // Query values are untrusted: a repeated parameter arrives as an array, so check the
    // type as well as the format. Missing means "use the default"; present but invalid is a 400.
    const { base, suffix } = req.query as Record<string, unknown>;

    if (base !== undefined && (typeof base !== "string" || parseIPv4(base) === null)) {
        res.status(400).json({ error: "base must be a single IPv4 address, e.g. 10.0.0.1" });
        return;
    }
    if (suffix !== undefined && (typeof suffix !== "string" || !SUFFIX_RE.test(suffix))) {
        res.status(400).json({ error: "suffix must be a single whole number from 1 to 32" });
        return;
    }

    res.json(cidrChoices(base ?? DEFAULT_BASE, suffix === undefined ? DEFAULT_SUFFIX : Number(suffix)));
});

// Last in the chain: log the real error, but never send its message or stack to the client.
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "internal error" });
};
app.use(errorHandler);

export { errorHandler };
export default app;
