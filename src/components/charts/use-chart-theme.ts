"use client";

import { useEffect, useState } from "react";

type ChartTheme = {
  grid:        string;
  axis:        string;
  tick:        string;
  tooltipBg:   string;
  tooltipBorder: string;
  tooltipText: string;
};

const DARK: ChartTheme = {
  grid:          "rgba(255,255,255,0.08)",
  axis:          "rgba(255,255,255,0.12)",
  tick:          "rgba(255,255,255,0.60)",
  tooltipBg:     "rgba(15,27,51,0.95)",
  tooltipBorder: "rgba(255,255,255,0.12)",
  tooltipText:   "rgba(255,255,255,0.92)",
};

const LIGHT: ChartTheme = {
  grid:          "rgba(0,0,0,0.08)",
  axis:          "rgba(0,0,0,0.12)",
  tick:          "rgba(0,0,0,0.55)",
  tooltipBg:     "rgba(255,255,255,0.97)",
  tooltipBorder: "rgba(0,0,0,0.12)",
  tooltipText:   "rgba(0,0,0,0.87)",
};

export function useChartTheme(): ChartTheme {
  const [theme, setTheme] = useState<ChartTheme>(DARK);

  useEffect(() => {
    function read() {
      const t = document.documentElement.getAttribute("data-theme");
      setTheme(t === "light" ? LIGHT : DARK);
    }
    read();

    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return theme;
}
