import { useAuth } from "@clerk/tanstack-react-start";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { components } from "@generated/api-schema";
import { useAppStore } from "@stores/app-store-provider";
import { apiRequest } from "@lib/api-client";

type CurrentMember = components["schemas"]["CurrentMemberResponseDto"];

export function MemberSessionSync() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { t } = useTranslation();
  const setMemberDisplayName = useAppStore(
    (state) => state.setMemberDisplayName,
  );
  const [apiUnavailable, setApiUnavailable] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setApiUnavailable(false);
      if (isLoaded) setMemberDisplayName(null);
      return;
    }

    let cancelled = false;
    setApiUnavailable(false);

    void apiRequest<CurrentMember>("auth/me", getToken)
      .then((member) => {
        if (!cancelled) setMemberDisplayName(member.displayName);
      })
      .catch(() => {
        if (!cancelled) setApiUnavailable(true);
      });

    return () => {
      cancelled = true;
    };
  }, [getToken, isLoaded, isSignedIn, setMemberDisplayName]);

  if (!apiUnavailable) return null;

  return (
    <p
      className="mb-5 rounded-xl border border-burgundy/20 bg-background p-4 text-sm text-secondary"
      role="alert"
    >
      {t("auth.apiUnavailable")}
    </p>
  );
}
