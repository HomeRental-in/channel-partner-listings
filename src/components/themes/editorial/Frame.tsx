import type { ReactNode } from "react";
import { BRAND, rootUrl } from "@/lib/site";
import { editorialFontClass } from "./fonts";
import "./editorial.css";

/** Theme root: fonts + cream canvas + masthead + "Powered by" footer. */
export function Frame({ mastheadName, mastheadHref, mastheadRight, hasMobileBar = false, preview = false, children }: { mastheadName: string; mastheadHref: string; mastheadRight?: ReactNode; hasMobileBar?: boolean; preview?: boolean; children: ReactNode }) {
  return (
    <div className={`ed ${editorialFontClass} ${hasMobileBar ? "ed-has-bar" : ""}`}>
      {preview && <div className="ed-preview" role="status">Preview — not published</div>}
      <div className="ed-wrap">
        <header className="ed-masthead">
          <a className="ed-masthead-name" href={mastheadHref}>{mastheadName}</a>
          {mastheadRight}
        </header>
        {children}
        <footer className="ed-footer">
          <span>
            Powered by <a href={rootUrl("/")}>{BRAND}</a>
          </span>
          <span className="ed-faint">Free listing pages for channel partners.</span>
        </footer>
      </div>
    </div>
  );
}
