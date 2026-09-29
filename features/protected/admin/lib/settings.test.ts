import { expect, test } from "bun:test";
import { bpsToInput, formatBps, percentToBps, settingInfo } from "./settings";

test("percentToBps convierte sin errores de coma flotante", () => {
  expect(percentToBps("10")).toBe(1000);
  expect(percentToBps("10,5")).toBe(1050);
  expect(percentToBps(" 10.05 ")).toBe(1005);
  expect(percentToBps("0")).toBe(0);
  expect(percentToBps("100")).toBe(10_000);
});

test("percentToBps rechaza lo que qatu-api no acepta", () => {
  for (const raw of ["", "abc", "-1", "100.01", "101", "10.555", "1e3"]) {
    expect(percentToBps(raw), raw).toBeUndefined();
  }
});

test("formatBps y bpsToInput", () => {
  expect(formatBps(1050)).toBe("10.5 %"); // es-PE usa punto decimal
  expect(formatBps(500)).toBe("5 %");
  expect(bpsToInput(1005)).toBe("10.05");
});

test("cada clave conoce su vertical", () => {
  expect(settingInfo("service.provider_commission_bps")?.vertical).toBe("service");
  expect(settingInfo("otra")).toBeUndefined();
});
