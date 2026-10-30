import { useEffect, useState } from "react";
import { formatDate } from "./calendar-formatters";
import type {
  ApiClient,
  CurrentMember,
  ModalState,
  Reservation,
  Translate,
  VoteChoice,
} from "./calendar-types";

type ReservationModalProps = {
  modal: ModalState;
  member: CurrentMember;
  locale: string;
  api: ApiClient;
  t: Translate;
  onClose: () => void;
  onChanged: () => void;
};

type ReservationFormProps = {
  reservation: Reservation | null;
  locale: string;
  startDate: string;
  endDate: string;
  overlaps: Reservation[];
  overlapError: boolean;
  saving: boolean;
  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
  t: Translate;
};

type ReservationDetailsProps = {
  reservation: Reservation;
  locale: string;
  ownsReservation: boolean;
  saving: boolean;
  onVote: (choice: VoteChoice) => void;
  onCancel: () => void;
  onEdit: () => void;
  onClose: () => void;
  t: Translate;
};

export function ReservationModal({
  modal,
  member,
  locale,
  api,
  t,
  onClose,
  onChanged,
}: ReservationModalProps) {
  const [view, setView] = useState<"details" | "form">(
    modal.type === "create" ? "form" : "details",
  );
  const [startDate, setStartDate] = useState(
    modal.type === "details" ? modal.reservation.startDate : "",
  );
  const [endDate, setEndDate] = useState(
    modal.type === "details" ? modal.reservation.endDate : "",
  );
  const [overlaps, setOverlaps] = useState<Reservation[]>([]);
  const [overlapError, setOverlapError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const reservation = modal.type === "details" ? modal.reservation : null;
  const ownsReservation = reservation?.creator.id === member.id;

  useEffect(() => {
    if (!startDate || !endDate || startDate > endDate) {
      setOverlaps([]);
      setOverlapError(false);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      const query = new URLSearchParams({ startDate, endDate });
      if (reservation) query.set("excludeReservationId", reservation.id);
      void api<Reservation[]>(`reservations/overlaps?${query}`).then(
        (results) => {
          if (!cancelled) {
            setOverlaps(results);
            setOverlapError(false);
          }
        },
        () => {
          if (!cancelled) {
            setOverlapError(true);
            setOverlaps([]);
          }
        },
      );
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [api, startDate, endDate, reservation]);

  async function saveDates(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!startDate || !endDate || startDate > endDate) {
      setError(t("calendar.invalidDates"));
      return;
    }
    setSaving(true);
    setError("");
    try {
      const body = JSON.stringify({ startDate, endDate });
      if (reservation) {
        await api(`reservations/${reservation.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body,
        });
      } else {
        await api("reservations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });
      }
      onChanged();
    } catch {
      setError(t("calendar.saveError"));
    } finally {
      setSaving(false);
    }
  }

  async function submitVote(choice: VoteChoice) {
    if (!reservation) return;
    setSaving(true);
    setError("");
    try {
      await api(`reservations/${reservation.id}/vote`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice }),
      });
      onChanged();
    } catch {
      setError(t("calendar.voteError"));
    } finally {
      setSaving(false);
    }
  }

  async function cancelReservation() {
    if (!reservation || !window.confirm(t("calendar.confirmCancel"))) return;
    setSaving(true);
    setError("");
    try {
      await api(`reservations/${reservation.id}`, { method: "DELETE" });
      onChanged();
    } catch {
      setError(t("calendar.cancelError"));
    } finally {
      setSaving(false);
    }
  }

  const title =
    view === "form"
      ? reservation
        ? t("calendar.editTitle")
        : t("calendar.createTitle")
      : t("calendar.detailsTitle");

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-secondary/50 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="max-h-[min(90vh,720px)] w-full max-w-md overflow-y-auto rounded-2xl bg-background p-5 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reservation-dialog-title"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2
            id="reservation-dialog-title"
            className="m-0 font-heading text-xl font-bold text-primary"
          >
            {title}
          </h2>
          <button
            className="rounded-lg px-2 py-1 text-2xl leading-none text-secondary hover:bg-focused-background"
            type="button"
            aria-label={t("calendar.close")}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {error && (
          <p
            className="mb-3 rounded-lg bg-burgundy/10 p-3 text-sm text-burgundy"
            role="alert"
          >
            {error}
          </p>
        )}

        {view === "form" ? (
          <ReservationForm
            reservation={reservation}
            locale={locale}
            startDate={startDate}
            endDate={endDate}
            overlaps={overlaps}
            overlapError={overlapError}
            saving={saving}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            onSubmit={saveDates}
            onBack={() => setView("details")}
            t={t}
          />
        ) : reservation ? (
          <ReservationDetails
            reservation={reservation}
            locale={locale}
            ownsReservation={ownsReservation}
            saving={saving}
            onVote={(choice) => void submitVote(choice)}
            onCancel={() => void cancelReservation()}
            onEdit={() => setView("form")}
            onClose={onClose}
            t={t}
          />
        ) : null}
      </section>
    </div>
  );
}

function ReservationForm({
  reservation,
  locale,
  startDate,
  endDate,
  overlaps,
  overlapError,
  saving,
  setStartDate,
  setEndDate,
  onSubmit,
  onBack,
  t,
}: ReservationFormProps) {
  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <label className="grid gap-1 text-sm font-semibold text-secondary">
        {t("calendar.startDate")}
        <input
          className="rounded-lg border border-burgundy/20 bg-light-background px-3 py-2 text-base text-secondary focus:border-primary focus:outline-none"
          type="date"
          required
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
        />
      </label>
      <label className="grid gap-1 text-sm font-semibold text-secondary">
        {t("calendar.endDate")}
        <input
          className="rounded-lg border border-burgundy/20 bg-light-background px-3 py-2 text-base text-secondary focus:border-primary focus:outline-none"
          type="date"
          min={startDate || undefined}
          required
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
        />
      </label>
      {overlapError && (
        <p className="m-0 text-sm text-muted">
          {t("calendar.overlapCheckUnavailable")}
        </p>
      )}
      {overlaps.length > 0 && (
        <div
          className="rounded-lg border border-bar bg-paper-light p-3 text-sm text-secondary"
          role="status"
        >
          <p className="m-0 font-semibold">
            {t("calendar.overlapWarning", { count: overlaps.length })}
          </p>
          <ul className="mb-0 mt-1 list-disc pl-5">
            {overlaps.slice(0, 3).map((item) => (
              <li key={item.id}>
                {item.creator.displayName} ·{" "}
                {formatDate(item.startDate, locale)} –{" "}
                {formatDate(item.endDate, locale)}
              </li>
            ))}
          </ul>
          {overlaps.length > 3 && (
            <p className="mb-0 mt-1">
              {t("calendar.moreOverlaps", { count: overlaps.length - 3 })}
            </p>
          )}
        </div>
      )}
      <div className="mt-2 flex justify-end gap-2">
        {reservation && (
          <button
            className="rounded-lg px-4 py-2 text-sm font-semibold text-secondary hover:bg-focused-background"
            type="button"
            onClick={onBack}
          >
            {t("calendar.back")}
          </button>
        )}
        <button
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-light-background disabled:opacity-50"
          type="submit"
          disabled={saving}
        >
          {saving ? t("calendar.saving") : t("calendar.save")}
        </button>
      </div>
    </form>
  );
}

function ReservationDetails({
  reservation,
  locale,
  ownsReservation,
  saving,
  onVote,
  onCancel,
  onEdit,
  onClose,
  t,
}: ReservationDetailsProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2 text-sm text-secondary">
        <p className="m-0">
          <span className="font-semibold">{t("calendar.member")}</span>{" "}
          {reservation.creator.displayName}
        </p>
        <p className="m-0">
          <span className="font-semibold">{t("calendar.period")}</span>{" "}
          {formatDate(reservation.startDate, locale)} –{" "}
          {formatDate(reservation.endDate, locale)}
        </p>
        <p className="m-0">
          <span className="font-semibold">{t("calendar.statusLabel")}</span>{" "}
          {t(`calendar.status.${reservation.status.toLowerCase()}`)}
        </p>
        {reservation.status === "PENDING" && (
          <p className="m-0">
            <span className="font-semibold">{t("calendar.votes")}</span>{" "}
            {reservation.approvals}/{reservation.totalEligibleVoters} ·{" "}
            {reservation.rejections} {t("calendar.rejections")}
          </p>
        )}
      </div>
      {reservation.status === "PENDING" && (
        <div className="grid grid-cols-2 gap-2">
          <button
            className={`rounded-lg border px-3 py-2 text-sm font-semibold ${reservation.currentMemberVote === "APPROVE" ? "border-primary bg-primary text-light-background" : "border-primary text-primary"}`}
            type="button"
            disabled={saving}
            onClick={() => onVote("APPROVE")}
          >
            {t("calendar.approve")}
          </button>
          <button
            className={`rounded-lg border px-3 py-2 text-sm font-semibold ${reservation.currentMemberVote === "REJECT" ? "border-burgundy bg-burgundy text-light-background" : "border-burgundy text-burgundy"}`}
            type="button"
            disabled={saving}
            onClick={() => onVote("REJECT")}
          >
            {t("calendar.reject")}
          </button>
        </div>
      )}
      <div className="flex flex-wrap justify-between gap-2 border-t border-burgundy/10 pt-4">
        {ownsReservation ? (
          <>
            <button
              className="rounded-lg px-3 py-2 text-sm font-semibold text-burgundy hover:bg-burgundy/10"
              type="button"
              disabled={saving}
              onClick={onCancel}
            >
              {t("calendar.cancelReservation")}
            </button>
            <button
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-light-background"
              type="button"
              disabled={saving}
              onClick={onEdit}
            >
              {t("calendar.edit")}
            </button>
          </>
        ) : (
          <span />
        )}
        <button
          className="rounded-lg px-3 py-2 text-sm font-semibold text-secondary hover:bg-focused-background"
          type="button"
          onClick={onClose}
        >
          {t("calendar.close")}
        </button>
      </div>
    </div>
  );
}
