import express from 'express';
import type { Request, Response } from 'express';
import {randomIP, randomSuffix} from "./ip.ts"
import {cidrChoices} from "./choice.ts"
import type { CidrChoiceQuery } from "@cidr-game/shared";

const app = express();

app.get("/api/hello", (_, res) => {
    res.json({ message: "Hello!" });
});

app.get("/api/new_ip", (_, res: Response) => {
    res.json({"ip": randomIP(), "suffix": randomSuffix()})
});

app.get("/api/generate", (req: Request<{}, {}, {}, CidrChoiceQuery>, res: Response) => {
    const base = req.query.base || '192.168.1.1';
    const suffix =  Number(req.query.suffix || '30');
    res.json(cidrChoices( base, suffix));
});

app.listen(3000, () => {
    console.log("Listening on :3000");
});
