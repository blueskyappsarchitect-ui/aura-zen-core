import { Globe, ChevronDown, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LANGUAGES, LANGUAGE_STORAGE_KEY } from "@/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const current =
    LANGUAGES.find((l) => l.code === i18n.resolvedLanguage) ?? LANGUAGES[0];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    } catch {
      /* storage unavailable */
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("language.select")}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-purple-600 px-2.5 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-purple-500/25 transition-colors duration-200 hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[state=open]:bg-purple-700 sm:px-3"
      >
        <Globe className="h-4 w-4" strokeWidth={1.75} />
        <span className="hidden sm:inline max-w-[7rem] truncate">
          {current.label}
        </span>
        <ChevronDown className="h-3.5 w-3.5 opacity-80" strokeWidth={2} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-[60] w-52 max-h-[70vh] overflow-y-auto">
        <DropdownMenuLabel>{t("language.label")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onSelect={() => changeLanguage(lang.code)}
            className="cursor-pointer gap-2"
          >
            <span aria-hidden className="text-base leading-none">{lang.flag}</span>
            <span className="flex-1 truncate">{lang.label}</span>
            {lang.code === current.code && (
              <Check className="h-4 w-4 text-purple-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
