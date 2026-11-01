import { Show, useUser, UserButton } from "@clerk/tanstack-react-start";
import { useTranslation } from "react-i18next";

type AuthControlsProps = {
  className?: string;
  showName?: boolean;
};

export function AuthControls({
  className = "",
  showName = false,
}: AuthControlsProps) {
  const { t } = useTranslation();

  return (
    <div
      className={`flex min-h-9 items-center gap-3 ${showName ? "justify-between" : "justify-end"} ${className}`}
    >
      <Show when="signed-out">
        <a
          href="/sign-in"
          className="rounded-lg px-3 py-2 text-sm font-semibold text-primary no-underline hover:bg-focused-background focus-visible:outline-3 focus-visible:outline-focus-ring focus-visible:outline-offset-2"
        >
          {t("auth.signIn")}
        </a>
      </Show>
      <Show when="signed-in">
        <SignedInControls showName={showName} />
      </Show>
    </div>
  );
}

function SignedInControls({ showName }: { showName: boolean }) {
  const { isLoaded, user } = useUser();
  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.fullName ||
    user?.primaryEmailAddress?.emailAddress;

  return (
    <div
      className={`flex min-w-0 items-center gap-3 ${showName ? "w-full justify-between" : ""}`}
    >
      {showName && isLoaded && name && (
        <span className="truncate text-sm font-semibold text-secondary">
          {name}
        </span>
      )}
      <UserButton />
    </div>
  );
}
