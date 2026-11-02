import { useEffect, useId, useRef, useState } from "react";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  labelledBy: string;
  menuPosition?: "above" | "below";
  required?: boolean;
};

export function Select({
  options,
  value,
  onChange,
  labelledBy,
  menuPosition = "below",
  required = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const optionsId = useId();
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    if (!isOpen) return;
    function closeOnOutsideClick(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [isOpen]);

  const menuPositionClass =
    menuPosition === "above" ? "bottom-full mb-1" : "top-full mt-1";

  return (
    <div className="relative" ref={containerRef}>
      <button
        className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-burgundy/20 bg-light-background py-2 pl-3 pr-4 text-left text-base font-normal text-secondary focus:border-primary focus:outline-none"
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={optionsId}
        aria-labelledby={labelledBy}
        aria-required={required || undefined}
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setIsOpen(true);
          } else if (event.key === "Escape") {
            setIsOpen(false);
          }
        }}
      >
        <span className="truncate">{selectedOption?.label ?? ""}</span>
        <svg
          aria-hidden="true"
          className={`ml-3 size-4 shrink-0 transition-transform${isOpen ? " rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="m5 7.5 5 5 5-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {isOpen && (
        <ul
          id={optionsId}
          className={`absolute left-0 right-0 z-50 max-h-56 overflow-y-auto rounded-lg border border-burgundy/20 bg-light-background py-1 shadow-lg ${menuPositionClass}`}
          role="listbox"
          aria-labelledby={labelledBy}
        >
          {options.map((option) => (
            <li key={option.value} role="presentation">
              <button
                className={`w-full cursor-pointer px-3 py-2 text-left text-base font-normal ${option.value === value ? "bg-focused-background text-primary" : "text-secondary hover:bg-focused-background"}`}
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
