import { describe, it, expect } from "vitest";
import { sanitizeInternalCitations } from "../contentSanitizer";

describe("sanitizeInternalCitations", () => {
  it("should return empty string if input is null or undefined", () => {
    expect(sanitizeInternalCitations(null as any)).toBe("");
    expect(sanitizeInternalCitations(undefined)).toBe("");
  });

  it("should not modify normal text", () => {
    const text = "This is a normal paragraph with no citations.";
    expect(sanitizeInternalCitations(text)).toBe(text);
  });

  it("should remove single antCitation artifact", () => {
    const text = "The treaty was signed in 2026. :antCitation[]{citations=\"uuid-1234\" injected=\"space\"} It changed everything.";
    const expected = "The treaty was signed in 2026.  It changed everything.";
    expect(sanitizeInternalCitations(text)).toBe(expected);
  });

  it("should remove multiple antCitation artifacts", () => {
    const text = "Fact A. :antCitation[]{citations=\"123\"} Fact B. :antCitation[]{citations=\"456\"}";
    const expected = "Fact A.  Fact B. ";
    expect(sanitizeInternalCitations(text)).toBe(expected);
  });

  it("should handle multi-line artifacts and text", () => {
    const text = "First line.\n:antCitation[]{citations=\"123\"}\nSecond line.";
    const expected = "First line.\n\nSecond line.";
    expect(sanitizeInternalCitations(text)).toBe(expected);
  });

  it("should preserve legitimate markdown links", () => {
    const text = "Click [here](https://example.com) for more info.";
    expect(sanitizeInternalCitations(text)).toBe(text);
  });

  it("should preserve normal URLs", () => {
    const text = "Visit https://google.com for searches.";
    expect(sanitizeInternalCitations(text)).toBe(text);
  });

  it("should preserve markdown footnotes", () => {
    const text = "This is a fact.[^1]\n\n[^1]: The source.";
    expect(sanitizeInternalCitations(text)).toBe(text);
  });

  it("should preserve normal human-written citation text", () => {
    const text = "As cited in the 2026 report (Smith et al., 2026), things are changing.";
    expect(sanitizeInternalCitations(text)).toBe(text);
  });
});
