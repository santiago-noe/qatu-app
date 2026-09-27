"use client";

import type { DateRange } from "react-day-picker";
import { es } from "react-day-picker/locale";
import { Calendar } from "@/components/ui/calendar";

interface DateRangeCalendarProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  months?: number;
}

// Se importa con next/dynamic: react-day-picker no entra en el JS inicial.
export default function DateRangeCalendar({ value, onChange, months = 1 }: DateRangeCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Calendar
      mode="range"
      locale={es}
      numberOfMonths={months}
      selected={value}
      onSelect={onChange}
      disabled={{ before: today }}
      defaultMonth={value?.from ?? today}
    />
  );
}
