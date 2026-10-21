import { useTranslation } from "react-i18next";

type PlaceholderPageProps = {
  titleKey: string;
  descriptionKey?: string;
};

export function PlaceholderPage({
  titleKey,
  descriptionKey,
}: PlaceholderPageProps) {
  const { t } = useTranslation();

  return (
    <section
      className="min-h-[min(58vh,560px)] rounded-[20px] border border-burgundy/[0.12] bg-paper-light/[0.56] px-6 py-[26px] shadow-[0_8px_28px_rgb(72_46_15_/_4%)]"
      aria-labelledby="page-title"
    >
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-burgundy">
        {t("app.name")}
      </p>
      <h1
        id="page-title"
        className="m-0 font-heading text-[clamp(25px,7vw,34px)] font-extrabold tracking-[-0.055em] text-teal"
      >
        {t("pages.title", { title: t(titleKey) })}
      </h1>
      {descriptionKey && (
        <p className="mt-3 text-[15px] leading-[1.6] text-muted">
          {t(descriptionKey)}
        </p>
      )}
    </section>
  );
}
