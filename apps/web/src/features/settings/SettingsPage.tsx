import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { components } from "@generated/api-schema";
import { Icons } from "@components/Icons";
import { useApiClient } from "@lib/api-client";
import { useAppStore } from "@stores/app-store-provider";
import { reservationPalette } from "@utils/colors";

type CurrentMember = components["schemas"]["CurrentMemberResponseDto"];
type BookingSettings = components["schemas"]["BookingSettingsResponseDto"];

export function SettingsPage() {
  const { t } = useTranslation();
  const api = useApiClient();
  const setMemberDisplayName = useAppStore(
    (state) => state.setMemberDisplayName,
  );
  const [member, setMember] = useState<CurrentMember | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [editingDisplayName, setEditingDisplayName] = useState(false);
  const [savingDisplayName, setSavingDisplayName] = useState(false);
  const [displayNameSaveError, setDisplayNameSaveError] = useState(false);
  const [approvalEnabled, setApprovalEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [colorDialogOpen, setColorDialogOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customColor, setCustomColor] = useState("");
  const [customSelected, setCustomSelected] = useState(false);
  const [savingColor, setSavingColor] = useState(false);
  const [colorSaveError, setColorSaveError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      setLoading(true);
      setLoadError(false);
      try {
        const currentMember = await api<CurrentMember>("auth/me");
        if (cancelled) return;
        setMember(currentMember);
        setDisplayName(currentMember.displayName);
        setMemberDisplayName(currentMember.displayName);

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
  }, [api, setMemberDisplayName]);

  useEffect(() => {
    if (!colorDialogOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setColorDialogOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [colorDialogOpen]);

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

  async function saveDisplayName() {
    const normalizedDisplayName = displayName.trim();
    if (
      !normalizedDisplayName ||
      normalizedDisplayName.length > 80 ||
      savingDisplayName
    )
      return;

    setSavingDisplayName(true);
    setDisplayNameSaveError(false);
    try {
      const updatedMember = await api<CurrentMember>("auth/me/display-name", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: normalizedDisplayName }),
      });
      setMember(updatedMember);
      setDisplayName(updatedMember.displayName);
      setMemberDisplayName(updatedMember.displayName);
      setEditingDisplayName(false);
    } catch {
      setDisplayNameSaveError(true);
    } finally {
      setSavingDisplayName(false);
    }
  }

  function openColorDialog() {
    if (!member) return;
    const matchingPreset = reservationPalette.find(
      ({ hex }) => hex.toUpperCase() === member.reservationColor.toUpperCase(),
    );
    setSelectedPreset(matchingPreset?.hex ?? null);
    setCustomColor(matchingPreset ? "" : member.reservationColor);
    setCustomSelected(!matchingPreset);
    setColorSaveError(false);
    setColorDialogOpen(true);
  }

  async function saveReservationColor() {
    const reservationColor = customSelected ? customColor : selectedPreset;
    if (!reservationColor || savingColor || !member) return;

    setSavingColor(true);
    setColorSaveError(false);
    try {
      const updatedMember = await api<CurrentMember>(
        "auth/me/reservation-color",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reservationColor }),
        },
      );
      setMember(updatedMember);
      setColorDialogOpen(false);
    } catch {
      setColorSaveError(true);
    } finally {
      setSavingColor(false);
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
        {!loading && member && (
          <>
            <div className="border-t border-burgundy/10 py-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
                {editingDisplayName ? (
                  <label
                    className="col-span-2 text-base font-bold leading-6 text-primary sm:col-span-1"
                    htmlFor="display-name"
                  >
                    {t("settings.displayName")}
                  </label>
                ) : (
                  <span className="col-span-2 text-base font-bold text-primary sm:col-span-1">
                    {t("settings.displayName")}
                  </span>
                )}
                {editingDisplayName ? (
                  <input
                    className="h-8 min-w-0 w-full rounded-md border border-burgundy/20 bg-display-name-input px-2 text-base leading-6 text-primary focus-visible:outline-2 focus-visible:outline-focus-ring"
                    id="display-name"
                    type="text"
                    maxLength={80}
                    value={displayName}
                    onChange={(event) =>
                      setDisplayName(event.currentTarget.value)
                    }
                  />
                ) : (
                  <span className="min-w-0 break-words text-base font-normal text-primary">
                    {member.displayName}
                  </span>
                )}
                {editingDisplayName ? (
                  <div className="flex items-center gap-2">
                    <button
                      className="h-8 shrink-0 cursor-pointer rounded-full border border-burgundy/20 px-3 font-semibold text-primary transition hover:-translate-y-px hover:border-primary hover:bg-focused-background hover:shadow-sm focus-visible:outline-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
                      type="button"
                      disabled={savingDisplayName}
                      onClick={() => {
                        setDisplayName(member.displayName);
                        setDisplayNameSaveError(false);
                        setEditingDisplayName(false);
                      }}
                      aria-label={t("settings.cancel")}
                    >
                      <span className="hidden sm:inline">
                        {t("settings.cancel")}
                      </span>
                      <span className="sm:hidden" aria-hidden="true">
                        <Icons name="close" width={16} />
                      </span>
                    </button>
                    <button
                      className="h-8 shrink-0 cursor-pointer rounded-full bg-primary px-3 font-semibold text-white transition hover:-translate-y-px hover:opacity-80 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
                      type="button"
                      disabled={
                        savingDisplayName ||
                        !displayName.trim() ||
                        displayName.trim().length > 80
                      }
                      onClick={() => void saveDisplayName()}
                      aria-label={
                        savingDisplayName
                          ? t("settings.saving")
                          : t("settings.save")
                      }
                    >
                      <span className="hidden sm:inline">
                        {savingDisplayName
                          ? t("settings.saving")
                          : t("settings.save")}
                      </span>
                      <span className="sm:hidden" aria-hidden="true">
                        <Icons name="save" width={16} />
                      </span>
                    </button>
                  </div>
                ) : (
                  <button
                    className="h-8 shrink-0 cursor-pointer rounded-full bg-primary px-6 font-semibold text-white transition hover:-translate-y-px hover:opacity-80 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-focus-ring"
                    type="button"
                    onClick={() => {
                      setDisplayName(member.displayName);
                      setDisplayNameSaveError(false);
                      setEditingDisplayName(true);
                    }}
                  >
                    {t("settings.edit")}
                  </button>
                )}
              </div>
              {displayNameSaveError && (
                <p className="mt-3 text-sm text-secondary" role="alert">
                  {t("settings.displayNameSaveError")}
                </p>
              )}
            </div>
            <button
              className="flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left transition hover:bg-focused-background focus-visible:outline-2 focus-visible:outline-focus-ring"
              type="button"
              onClick={openColorDialog}
              aria-haspopup="dialog"
            >
              <span className="text-base font-bold text-primary">
                {t("settings.reservationColor")}
              </span>
              <span
                className="size-12 shrink-0 rounded-full border border-secondary/20"
                style={{ backgroundColor: member.reservationColor }}
                aria-label={member.reservationColor}
              />
            </button>
          </>
        )}
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

      {colorDialogOpen && member && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-secondary/50 p-2 md:p-5"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setColorDialogOpen(false);
          }}
        >
          <section
            className="h-auto max-h-[min(90vh,760px)] w-full max-w-[800px] overflow-y-auto rounded-2xl bg-background p-2 shadow-2xl md:h-[min(90vh,840px)] md:max-h-[min(90vh,840px)] md:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reservation-color-title"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2
                id="reservation-color-title"
                className="m-0 font-heading text-xl font-bold text-primary"
              >
                {t("settings.reservationColor")}
              </h2>
              <button
                className="shrink-0 rounded-lg px-2 py-1 text-2xl leading-none text-secondary hover:bg-focused-background focus-visible:outline-2 focus-visible:outline-focus-ring"
                type="button"
                aria-label={t("settings.close")}
                onClick={() => setColorDialogOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-4 justify-items-center gap-x-0 gap-y-3 md:grid-cols-6 md:gap-x-2 md:gap-y-4">
              {reservationPalette.map(({ nameKey, hex }) => {
                const selected = selectedPreset === hex;
                return (
                  <button
                    key={hex}
                    className="flex cursor-pointer flex-col items-center gap-2 rounded-xl p-0 focus-visible:outline-2 focus-visible:outline-focus-ring"
                    type="button"
                    aria-label={t(`settings.colors.${nameKey}`)}
                    aria-pressed={selected}
                    onClick={() => {
                      setSelectedPreset(hex);
                      setCustomColor("");
                      setCustomSelected(false);
                    }}
                  >
                    <span
                      className={`size-[72px] rounded-full transition md:size-24 hover:scale-105 hover:ring-4 hover:ring-light-primary hover:ring-offset-2 hover:ring-offset-background ${selected ? "ring-4 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                      style={{ backgroundColor: hex }}
                      aria-hidden="true"
                    />
                    <span className="hidden text-center text-sm text-secondary md:block">
                      {t(`settings.colors.${nameKey}`)}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex items-center gap-4 border-t border-burgundy/10 pt-4">
              <label
                className={`relative grid size-[72px] shrink-0 cursor-pointer place-items-center rounded-full border-2 border-dashed border-secondary/50 focus-within:outline-2 focus-within:outline-focus-ring focus-within:outline-offset-4 md:size-24 ${customSelected ? "ring-4 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                style={
                  customColor ? { backgroundColor: customColor } : undefined
                }
              >
                {!customColor && (
                  <span
                    className="text-3xl leading-none text-secondary"
                    aria-hidden="true"
                  >
                    +
                  </span>
                )}
                <input
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                  type="color"
                  aria-label={t("settings.customColor")}
                  value={customColor || "#FFFFFF"}
                  onClick={() => {
                    setSelectedPreset(null);
                    setCustomSelected(true);
                  }}
                  onChange={(event) => {
                    setSelectedPreset(null);
                    setCustomColor(event.currentTarget.value.toUpperCase());
                    setCustomSelected(true);
                  }}
                />
              </label>
              <span className="text-sm text-secondary">
                {t("settings.customColor")}
              </span>
            </div>

            {colorSaveError && (
              <p
                className="mt-4 rounded-xl border border-burgundy/20 bg-background p-3 text-sm text-secondary"
                role="alert"
              >
                {t("settings.colorSaveError")}
              </p>
            )}

            <div className="mt-5 flex justify-end">
              <button
                className="rounded-full bg-primary px-6 py-3 font-semibold text-white transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-focus-ring disabled:cursor-wait disabled:opacity-60"
                type="button"
                disabled={savingColor || (!selectedPreset && !customColor)}
                onClick={() => void saveReservationColor()}
              >
                {savingColor ? t("settings.saving") : t("settings.save")}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
