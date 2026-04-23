const request = require("supertest");
const app = require("../src/app");

describe("GET /", () => {
    it("should return 200 with welcome message", async () => {
        const res = await request(app).get("/");
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain("Talent Sync Backend Running");
    });
});

describe("GET /health", () => {
    it("should return 200 with status OK", async () => {
        const res = await request(app).get("/health");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ status: "OK" });
    });
});