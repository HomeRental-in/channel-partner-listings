import type { ReactNode } from "react";
import { BRAND, rootUrl } from "@/lib/site";
import { editorialFontClass } from "./fonts";
import "./editorial.css";

/**
 * Theme root: fonts + cream canvas + masthead + "Powered by" footer.
 * Masthead brand: `masthead` (a <BrandMark/> — logo or name) or plain `mastheadName`; with neither, the slot stays empty.
 */
export function Frame({ mastheadName, masthead, mastheadHref, mastheadRight, hasMobileBar = false, preview = false, children }: { mastheadName?: string; masthead?: ReactNode; mastheadHref: string; mastheadRight?: ReactNode; hasMobileBar?: boolean; preview?: boolean; children: ReactNode }) {
  const brand = masthead ?? mastheadName;
  return (
    <div className={`ed ${editorialFontClass} ${hasMobileBar ? "ed-has-bar" : ""}`}>
      {preview && <div className="ed-preview" role="status">Preview — not published</div>}
      <div className="ed-wrap">
        <header className="ed-masthead">
          {brand ? <a className="ed-masthead-name" href={mastheadHref}>{brand}</a> : <span aria-hidden="true" />}
          {mastheadRight}
        </header>
        {children}
        <footer className="ed-footer">
          <span>
            Powered by <a href={rootUrl("/")}>{BRAND}</a>
          </span>
          <span className="ed-faint">Fast, honest property pages.</span>
        </footer>
      </div>
    </div>
  );
}
