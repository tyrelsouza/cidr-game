import express from 'express';
import type { Request, Response } from 'express';
import { randomIP, randomSuffix } from "./ip.ts";
import { cidrChoices } from "./choice.ts";
import type { CidrChoiceQuery } from "@cidr-game/shared";

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

app.get("/api/generate", (req: Request<{}, {}, {}, CidrChoiceQuery>, res: Response) => {
    const base = req.query.base || '192.168.1.1';
    const suffix = Number(req.query.suffix || '30');

    res.json(cidrChoices(base, suffix));
});

export default app;
