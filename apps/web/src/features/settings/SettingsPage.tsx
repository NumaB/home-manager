import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { components } from "@generated/api-schema";
import { useApiClient } from "@lib/api-client";

type CurrentMember = components["schemas"]["CurrentMemberResponseDto"];
type BookingSettings = components["schemas"]["BookingSettingsResponseDto"];

export function SettingsPage() {
  const { t } = useTranslation();
  const api = useApiClient();
  const [member, setMember] = useState<CurrentMember | null>(null);
  const [approvalEnabled, setApprovalEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      setLoading(true);
      setLoadError(false);
      try {
        const currentMember = await api<CurrentMember>("auth/me");
        if (cancelled) return;
        setMember(currentMember);

        if (currentMember.role === "ADMIN") {
          const settings = await api<BookingSettings>("admin/booking-settings");
          if (cancelled) return;
          setApprovalEnabled(settings.approvalEnabled);
        }
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadSettings();
    return () => {
      cancelled = true;
    };
  }, [api]);

  async function toggleApproval() {
    if (approvalEnabled === null || saving) return;

    setSaving(true);
    setSaveError(false);
    try {
      const settings = await api<BookingSettings>("admin/booking-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalEnabled: !approvalEnabled }),
      });
      setApprovalEnabled(settings.approvalEnabled);
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="m-0 font-heading text-[32px] font-extrabold tracking-[-0.055em] text-primary md:text-[40px]">
          {t("settings.title")}
        </h1>
      </header>

      {loadError && (
        <p
          className="mb-6 rounded-xl border border-burgundy/20 bg-background p-4 text-sm text-secondary"
          role="alert"
        >
          {t("settings.loadError")}
        </p>
      )}

      <section className="mb-8" aria-labelledby="account-settings-title">
        <div className="mb-4">
          <h2
            id="account-settings-title"
            className="m-0 font-heading text-xl font-bold text-primary"
          >
            {t("settings.accountTitle")}
          </h2>
        </div>
      </section>
      {!loading && member?.role === "ADMIN" && (
        <section aria-labelledby="admin-settings-title">
          <div className="mb-4">
            <h2
              id="admin-settings-title"
              className="m-0 font-heading text-xl font-bold text-primary"
            >
              {t("settings.adminTitle")}
            </h2>
          </div>

          <div className="flex items-center justify-between gap-5 border-t border-burgundy/10 py-5">
            <div>
              <h3 className="m-0 text-base font-bold text-primary">
                {t("settings.approvalTitle")}
              </h3>
              <p className="mb-0 mt-1 max-w-xl text-sm leading-5 text-secondary">
                {t("settings.approvalDescription")}
              </p>
              <p className="mb-0 mt-2 max-w-xl text-xs leading-5 text-muted">
                {t("settings.approvalChangeHint")}
              </p>
              {approvalEnabled === false && (
                <p className="mb-0 mt-2 text-xs text-muted">
                  {t("settings.approvalDisabledHint")}
                </p>
              )}
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={approvalEnabled ?? false}
              aria-label={t("settings.approvalTitle")}
              disabled={approvalEnabled === null || saving}
              onClick={() => void toggleApproval()}
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-3 focus-visible:outline-focus-ring focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60 ${approvalEnabled ? "bg-primary" : "bg-burgundy/25"}`}
            >
              <span
                className={`absolute top-1 left-1 size-5 rounded-full bg-white shadow transition-transform ${approvalEnabled ? "translate-x-5" : "translate-x-0"}`}
                aria-hidden="true"
              />
            </button>
          </div>

          {saveError && (
            <p
              className="mt-3 rounded-xl border border-burgundy/20 bg-background p-4 text-sm text-secondary"
              role="alert"
            >
              {t("settings.saveError")}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
