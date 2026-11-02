import { useEffect, useRef, useState } from "react";
import type { CalendarDateRange } from "./calendar-date-utils";

type UseCalendarDateSelectionOptions = {
  defaultColor: string | null;
  onCreate: (range: CalendarDateRange) => void;
};

type PointerDrag = {
  pointerId: number;
  startDate: string;
  endDate: string;
  moved: boolean;
};

export function useCalendarDateSelection({
  defaultColor,
  onCreate,
}: UseCalendarDateSelectionOptions) {
  const [previewRange, setPreviewRange] = useState<CalendarDateRange | null>(
    null,
  );
  const [previewColor, setPreviewColor] = useState<string | null>(null);
  const [isPointerDragging, setIsPointerDragging] = useState(false);
  const pointerDrag = useRef<PointerDrag | null>(null);
  const suppressNextClick = useRef(false);
  const defaultColorRef = useRef(defaultColor);
  const onCreateRef = useRef(onCreate);
  defaultColorRef.current = defaultColor;
  onCreateRef.current = onCreate;

  const clearPreview = () => {
    pointerDrag.current = null;
    setPreviewRange(null);
    setPreviewColor(null);
    setIsPointerDragging(false);
  };

  const handleDayPointerDown = (dateKey: string, pointerId: number) => {
    pointerDrag.current = {
      pointerId,
      startDate: dateKey,
      endDate: dateKey,
      moved: false,
    };
    setIsPointerDragging(true);
    setPreviewColor(defaultColorRef.current);
    suppressNextClick.current = false;
  };

  const handleDayClick = (dateKey: string) => {
    if (suppressNextClick.current) {
      suppressNextClick.current = false;
      return;
    }
    onCreateRef.current({ startDate: dateKey, endDate: dateKey });
  };

  useEffect(() => {
    const getDateAtPoint = (event: PointerEvent) =>
      document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest<HTMLElement>("[data-calendar-date]")?.dataset.calendarDate;

    const handlePointerMove = (event: PointerEvent) => {
      const drag = pointerDrag.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const dateKey = getDateAtPoint(event);
      if (!dateKey) return;
      if (dateKey !== drag.startDate) drag.moved = true;
      drag.endDate = dateKey;
      if (drag.moved) {
        setPreviewRange({ startDate: drag.startDate, endDate: dateKey });
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      const drag = pointerDrag.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      pointerDrag.current = null;
      setIsPointerDragging(false);
      if (!drag.moved) {
        setPreviewRange(null);
        setPreviewColor(null);
        return;
      }

      suppressNextClick.current = true;
      window.setTimeout(() => {
        suppressNextClick.current = false;
      }, 0);

      const endDate = getDateAtPoint(event) ?? drag.endDate;
      setPreviewRange({ startDate: drag.startDate, endDate });
      onCreateRef.current({
        startDate: drag.startDate < endDate ? drag.startDate : endDate,
        endDate: drag.startDate > endDate ? drag.startDate : endDate,
      });
    };

    const handlePointerCancel = (event: PointerEvent) => {
      if (pointerDrag.current?.pointerId !== event.pointerId) return;
      clearPreview();
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
    };
  }, []);

  return {
    previewRange,
    previewColor,
    setPreviewColor,
    isPointerDragging,
    handleDayPointerDown,
    handleDayClick,
    clearPreview,
  };
}
