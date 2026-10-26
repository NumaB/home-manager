export function AppHeader() {
  return (
    <header className="mx-auto flex w-full max-w-[760px] items-center gap-[11px] px-[22px] pt-[22px] pb-4 text-primary md:hidden">
      <span
        className="grid size-[34px] shrink-0 place-items-center rounded-[10px_10px_10px_3px] border-[1.5px] border-light-primary font-heading text-xs font-extrabold tracking-[-0.08em]"
        aria-hidden="true"
      >
        HM
      </span>
      <span className="font-heading text-base font-extrabold tracking-[-0.03em]">
        Home Manager
      </span>
    </header>
  );
}
