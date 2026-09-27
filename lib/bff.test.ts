import { describe, expect, test } from "bun:test";
import { clientIp } from "./bff";

describe("clientIp", () => {
  test("toma la IP que agregó el gateway (la última)", () => {
    expect(clientIp("6.6.6.6, 190.117.10.20")).toBe("190.117.10.20");
  });

  test("una sola IP", () => {
    expect(clientIp("190.117.10.20")).toBe("190.117.10.20");
  });

  test.each([null, "", " "])("sin cabecera (%p) no inventa una IP", (header) => {
    expect(clientIp(header)).toBeUndefined();
  });
});
