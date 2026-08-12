import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import BaseIP from "./BaseIP";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("BaseIP", () => {
  it("loads and renders choices for a CIDR question", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({
        choices: ["192.168.1.0", "192.168.1.4", "192.168.1.8"],
        answer: 1,
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<BaseIP cidr={{ ip: "192.168.1.6", suffix: 30 }} />);

    expect(await screen.findByRole("button", { name: "192.168.1.4" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "192.168.1.6/30" })).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/generate?base=192.168.1.6&suffix=30",
    );
  });

  it("calls the matching callback for correct and incorrect choices", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({ choices: ["10.0.0.0", "10.0.0.4"], answer: 0 }),
      }),
    );
    const handleCorrect = vi.fn();
    const handleIncorrect = vi.fn();

    render(
      <BaseIP
        cidr={{ ip: "10.0.0.1", suffix: 30 }}
        handleCorrect={handleCorrect}
        handleIncorrect={handleIncorrect}
      />,
    );
    await screen.findByRole("button", { name: "10.0.0.0" });

    fireEvent.click(screen.getByRole("button", { name: "10.0.0.0" }));
    fireEvent.click(screen.getByRole("button", { name: "10.0.0.4" }));

    expect(handleCorrect).toHaveBeenCalledOnce();
    expect(handleIncorrect).toHaveBeenCalledOnce();
  });
});
