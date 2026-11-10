import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "./app.ts";

// Every request gets a timeout so a hang (bug 1) fails the test instead of stalling the run.
const TIMEOUT_MS = 2000;
const generate = (query: string) => request(app).get(`/api/generate?${query}`).timeout(TIMEOUT_MS);

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

describe("GET /api/generate input validation", () => {
    // expected networks checked with Python's ipaddress module
    describe("accepts valid input", () => {
        it.each([
            ["base=10.0.15.130&suffix=26", "10.0.15.128"],
            ["base=255.255.255.255&suffix=32", "255.255.255.255"],
            ["base=0.0.0.0&suffix=1", "0.0.0.0"],
            ["base=192.168.1.1&suffix=8", "192.0.0.0"],
        ])("%s -> correct answer %s", async (query, network) => {
            const res = await generate(query);

            expect(res.status).toBe(200);
            expect(res.body.choices[res.body.answer]).toBe(network);
        });
    });

    describe("uses the defaults (192.168.1.1, /30) for missing parameters", () => {
        it.each([
            ["", "192.168.1.0"],                         // both missing: 192.168.1.1/30
            ["base=10.0.15.130", "10.0.15.128"],         // suffix missing: /30
            ["suffix=24", "192.168.1.0"],                // base missing: 192.168.1.1
        ])("%j -> correct answer %s", async (query, network) => {
            const res = await generate(query);

            expect(res.status).toBe(200);
            expect(res.body.choices[res.body.answer]).toBe(network);
        });
    });

    describe("rejects an invalid suffix with 400", () => {
        it.each([
            "abc", "2000", "-2000", "0", "33", "1.5", "", "08", "%2030", "%2B30", "1e1", "Infinity", "NaN",
        ])("suffix=%s", async (suffix) => {
            const res = await generate(`base=10.0.0.1&suffix=${suffix}`);

            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: expect.any(String) });
        });
    });

    describe("rejects an invalid base with 400", () => {
        it.each([
            "999.1.1.1", "256.0.0.0", "1.2.3", "1.2.3.4.5", "apple", "", "01.2.3.4",
            "1.2.3.-4", "%201.2.3.4", "1..3.4", "0x1.2.3.4", "1.2.3.4%2F24",
        ])("base=%s", async (base) => {
            const res = await generate(`base=${base}&suffix=24`);

            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: expect.any(String) });
        });
    });

    describe("rejects repeated parameters with 400", () => {
        it.each([
            "base=a&base=b",
            "base=1.2.3.4&base=1.2.3.4",
            "base=1.2.3.4&suffix=1&suffix=2",
        ])("%s", async (query) => {
            const res = await generate(query);

            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: expect.any(String) });
        });
    });
});
