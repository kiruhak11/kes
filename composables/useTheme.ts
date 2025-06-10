import { useCookie, useHead } from "#app";

export const useTheme = () => {
  const theme = useCookie("theme", { default: () => "light" });

  const setTheme = (t: "light" | "dark") => {
    theme.value = t;
    document.documentElement.setAttribute("data-theme", t);
  };

  // при монтировании
  if (process.client) {
    setTheme(theme.value as any);
  }

  return { theme, setTheme };
};
