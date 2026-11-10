import { describe, it, expect } from "vitest";
import express from "express";
import request from "supertest";
import { errorHandler } from "./app.ts";

describe("errorHandler", () => {
    // A throwaway app with a route that throws, so the handler can be tested on its own.
    const app = express();
    app.get("/boom", () => {
        throw new Error("secret detail at /workspaces/cidr-game/apps/node/src/thing.ts");
    });
    app.use(errorHandler);

    it("returns a JSON 500 without the error message or stack trace", async () => {
        const res = await request(app).get("/boom");

        expect(res.status).toBe(500);
        expect(res.headers["content-type"]).toMatch(/application\/json/);
        expect(res.body).toEqual({ error: "internal error" });
        expect(res.text).not.toContain("secret detail");
        expect(res.text).not.toContain("/workspaces/");
    });
});
