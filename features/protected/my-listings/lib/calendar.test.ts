import { expect, test } from "bun:test";
import type { ApiBlock } from "@/lib/api";
import { blockedRanges, blockRequest, calendarWindow, formatBlock, limaDay, limaDayStart } from "./calendar";

test("un rango de días se guarda con fin excluido, en hora de Lima", () => {
  expect(limaDayStart(new Date(2026, 9, 5))).toBe("2026-10-05T00:00:00-05:00");
  expect(blockRequest(new Date(2026, 9, 5), new Date(2026, 9, 8))).toEqual({
    start: "2026-10-05T00:00:00-05:00",
    end: "2026-10-09T00:00:00-05:00",
  });
  // Fin de mes y de año.
  expect(blockRequest(new Date(2026, 11, 31), new Date(2026, 11, 31)).end).toBe("2027-01-01T00:00:00-05:00");
});

test("el día de Lima de un instante", () => {
  // 03:00 UTC del 6 es aún el 5 en Lima.
  const d = limaDay("2026-10-06T03:00:00Z");
  expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 9, 5]);
});

const block = (start: string, end: string): ApiBlock => ({ id: "b", start, end, reason: "manual" });

test("días ocupados y texto de cada bloqueo", () => {
  const b = block("2026-10-05T05:00:00Z", "2026-10-09T05:00:00Z"); // 5 al 8 de octubre en Lima
  const [range] = blockedRanges([b]);
  expect(range.from.getDate()).toBe(5);
  expect(range.to.getDate()).toBe(8);
  expect(formatBlock(b)).toBe("5 de octubre al 8 de octubre");
  expect(formatBlock(block("2026-10-05T05:00:00Z", "2026-10-06T05:00:00Z"))).toBe("5 de octubre");
});

test("la ventana va de hoy a un año", () => {
  expect(calendarWindow(new Date("2026-09-30T15:00:00Z"))).toEqual({
    from: "2026-09-30T00:00:00-05:00",
    to: "2027-09-30T00:00:00-05:00",
  });
});
