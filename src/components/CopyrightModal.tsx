import { useState } from "react";
import { X, Copyright } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";

const CopyrightModal = () => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={t("copyright.open")}
        className="relative inline-flex shrink-0 items-center justify-center rounded-xl bg-amber-500/10 p-2.5 text-amber-400 transition-all duration-200 hover:bg-amber-500/20 hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Copyright className="h-5 w-5" strokeWidth={1.75} />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl overflow-hidden border-0 bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">{t("copyright.title")}</DialogTitle>
          <DialogDescription className="sr-only">{t("copyright.description")}</DialogDescription>
          <div className="relative rounded-3xl border border-amber-400/60 bg-gradient-to-br from-slate-900 via-[#0f172a] to-[#0b1221] p-8 shadow-[0_0_40px_-10px_rgba(251,191,36,0.35)] sm:p-10">
            {/* subtle inner glow */}
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-amber-400/5" />

            <button
              onClick={() => setOpen(false)}
              aria-label={t("copyright.close")}
              className="absolute right-4 top-4 rounded-full p-2 text-amber-300/80 transition-colors hover:bg-amber-400/10 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>

            <div className="relative space-y-6 text-center">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300/80">
                  {t("copyright.disclaimer")}
                </p>
                <h2 className="font-serif text-3xl font-medium text-white sm:text-4xl">
                  {t("copyright.title")}
                </h2>
              </div>

              <p className="font-serif text-lg text-amber-300 sm:text-xl">
                {t("copyright.line")}
              </p>

              <div className="space-y-4 text-left text-sm leading-relaxed text-slate-300 sm:text-base">
                <p>{t("copyright.body1")}</p>
                <p>{t("copyright.body2")}</p>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-full border border-amber-400/70 bg-amber-400/10 px-10 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-amber-300 transition-all duration-200 hover:bg-amber-400/20 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f172a]"
              >
                {t("copyright.acknowledge")}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CopyrightModal;
