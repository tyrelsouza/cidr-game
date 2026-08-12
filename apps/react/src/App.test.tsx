import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("App", () => {
  it("starts a game and displays the generated question", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        json: async () => ({ ip: "10.0.15.130", suffix: 26 }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          choices: ["10.0.15.128", "10.0.15.192", "10.0.15.0", "10.0.16.0"],
          answer: 0,
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "New Game" }));

    expect(await screen.findByRole("heading", { name: "10.0.15.130/26" })).toBeTruthy();
    expect(screen.getByText("What is the Base IP?")).toBeTruthy();
    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/new_ip");
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/generate?base=10.0.15.130&suffix=26",
    );
  });

  it("updates the score after a correct answer", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        json: async () => ({ ip: "192.168.1.1", suffix: 30 }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ choices: ["192.168.1.0", "192.168.1.4"], answer: 1 }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ ip: "192.168.1.2", suffix: 30 }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ choices: ["192.168.1.0", "192.168.1.4"], answer: 0 }),
      });
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "New Game" }));
    await screen.findByRole("button", { name: "192.168.1.4" });
    fireEvent.click(screen.getByRole("button", { name: "192.168.1.4" }));

    expect(await screen.findByText("SCORE: 1/0")).toBeTruthy();
  });
});
