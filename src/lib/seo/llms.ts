import { HOME_FAQS, PARTNER_FAQS } from "@/components/marketing/faqs";
import { ANSWERS } from "./answers";
import { CITIES } from "./cities";
import { FACTS, NOT, ONE_LINER, WHO_FOR } from "./facts";
import { BRAND, rootUrl } from "@/lib/site";

const link = (title: string, path: string, note?: string) => `- [${title}](${rootUrl(path)})${note ? `: ${note}` : ""}`;

/** llms.txt (https://llmstxt.org): a Markdown map of the site for AI assistants. `full` inlines every answer. */
export function buildLlmsTxt(full: boolean) {
  const out = [
    `# ${BRAND}`,
    "",
    `> ${ONE_LINER}`,
    "",
    "## Key facts",
    ...FACTS.map((f) => `- ${f}`),
    "",
    "## Who it's for",
    ...WHO_FOR.map((f) => `- ${f}`),
    "",
    "## What it is not",
    ...NOT.map((f) => `- ${f}`),
    "",
    "## Pages",
    link("Home", "/", "product overview, how it works, features"),
    link("Sample listing", "/sample", "what a buyer sees"),
    link("Founding Partner programme", "/partners", "for CP firms with 1,000+ listings or links a month in one city"),
    link("Channel partners by city", "/channel-partners"),
    link("Privacy", "/privacy"),
    "",
    "## Answers",
    ...ANSWERS.map((a) => link(a.question, `/answers/${a.slug}`)),
    "",
    "## Cities",
    ...CITIES.map((c) => link(`Channel partners in ${c.name}`, `/channel-partners/${c.slug}`, c.localities.slice(0, 4).join(", "))),
  ];
  if (full) {
    out.push("", "## FAQ", ...[...HOME_FAQS, ...PARTNER_FAQS].flatMap((f) => ["", `### ${f.q}`, "", f.a]));
    for (const a of ANSWERS) {
      out.push("", `## ${a.question}`, "", a.short);
      if (a.steps) out.push("", ...a.steps.map((s, i) => `${i + 1}. **${s.name}.** ${s.text}`));
      for (const s of a.sections) {
        out.push("", `### ${s.heading}`);
        if (s.paras) out.push("", ...s.paras);
        if (s.bullets) out.push("", ...s.bullets.map((b) => `- ${b}`));
      }
      for (const f of a.faqs) out.push("", `**${f.q}** ${f.a}`);
    }
  } else {
    out.push("", "## Optional", link("Full text for AI assistants", "/llms-full.txt"));
  }
  return out.join("\n") + "\n";
}
