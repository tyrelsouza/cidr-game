import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "./app.ts";

describe("API", () => {
    it("GET /api/new_ip returns an IP and suffix", async () => {
        const res = await request(app).get("/api/new_ip");

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("ip");
        expect(res.body).toHaveProperty("suffix");
    });

    it("GET /api/generate returns choices", async () => {
        const res = await request(app)
            .get("/api/generate")
            .query({
                base: "10.0.15.130",
                suffix: 26
            });

        expect(res.status).toBe(200);
        expect(res.body).toBeDefined();
    });
});
