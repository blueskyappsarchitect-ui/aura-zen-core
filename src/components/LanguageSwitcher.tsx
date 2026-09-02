import { Globe, ChevronDown, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SUPPORTED_LANGUAGES } from "@/i18n";
import { cn } from "@/lib/utils";

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const current =
    SUPPORTED_LANGUAGES.find((l) => l.code === i18n.resolvedLanguage) ??
    SUPPORTED_LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("language.select")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3.5 py-2 min-h-[40px]",
            "bg-purple-600 text-white font-medium text-sm shadow-sm",
            "hover:bg-purple-700 active:bg-purple-800 transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          <Globe className="w-4 h-4 shrink-0" strokeWidth={2} />
          <span className="hidden sm:inline whitespace-nowrap max-w-[9rem] truncate">
            {t("language.label")}
          </span>
          <span className="sm:hidden text-xs font-semibold uppercase">
            {current.code}
          </span>
          <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-80" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 max-h-[70vh] overflow-y-auto z-[60]">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onSelect={() => i18n.changeLanguage(lang.code)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span aria-hidden className="text-base leading-none">{lang.flag}</span>
            <span className="flex-1 truncate">{lang.label}</span>
            {current.code === lang.code && (
              <Check className="w-4 h-4 text-purple-600 shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
