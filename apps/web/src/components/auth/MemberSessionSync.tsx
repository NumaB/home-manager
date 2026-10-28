import { useAuth } from "@clerk/tanstack-react-start";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiRequest } from "../../lib/api-client";

type CurrentMember = {
  id: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
};

export function MemberSessionSync() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { t } = useTranslation();
  const [apiUnavailable, setApiUnavailable] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setApiUnavailable(false);
      return;
    }

    let cancelled = false;
    setApiUnavailable(false);

    void apiRequest<CurrentMember>("auth/me", getToken).catch(() => {
      if (!cancelled) setApiUnavailable(true);
    });

    return () => {
      cancelled = true;
    };
  }, [getToken, isLoaded, isSignedIn]);

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
