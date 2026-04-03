import { describe, it, expect } from "vitest";
import { parseArxivId } from "../arxiv";

describe("parseArxivId", () => {
  it("parses a standard abs URL", () => {
    expect(parseArxivId("https://arxiv.org/abs/2301.12345")).toBe("2301.12345");
  });

  it("parses a pdf URL", () => {
    expect(parseArxivId("https://arxiv.org/pdf/2301.12345")).toBe("2301.12345");
  });

  it("parses a versioned URL", () => {
    expect(parseArxivId("https://arxiv.org/abs/2301.12345v2")).toBe(
      "2301.12345"
    );
  });

  it("parses a bare ID", () => {
    expect(parseArxivId("2301.12345")).toBe("2301.12345");
  });

  it("returns null for invalid URLs", () => {
    expect(parseArxivId("https://google.com")).toBeNull();
    expect(parseArxivId("not a url")).toBeNull();
  });
});
