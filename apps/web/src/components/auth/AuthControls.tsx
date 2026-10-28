import { Show, UserButton } from "@clerk/tanstack-react-start";
import { useTranslation } from "react-i18next";

type AuthControlsProps = {
  className?: string;
};

export function AuthControls({ className = "" }: AuthControlsProps) {
  const { t } = useTranslation();

  return (
    <div className={`flex min-h-9 items-center justify-end gap-3 ${className}`}>
      <Show when="signed-out">
        <a
          href="/sign-in"
          className="rounded-lg px-3 py-2 text-sm font-semibold text-primary no-underline hover:bg-focused-background focus-visible:outline-3 focus-visible:outline-[#bf7d00] focus-visible:outline-offset-2"
        >
          {t("auth.signIn")}
        </a>
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </div>
  );
}
