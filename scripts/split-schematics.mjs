/* ============================================================================
   split-schematics.mjs — one source sheet in, one standalone diagram out.

   The architecture diagrams arrive as four print sheets, each carrying three to
   five hand-authored SVGs in a single <style> scope (~350 KB in total, one file
   alone is 117 KB). Inlining that into the React tree would put the whole set in
   the client bundle whether or not anyone looks at it, and would collide the
   files' identically-named <marker> ids against each other the moment two
   diagrams shared a document.

   So each <section class="panel"> is lifted into its own document under
   public/schematics/, carrying a verbatim copy of its sheet's <style>. The
   viewer then loads exactly one diagram, in its own browsing context, with the
   original typography intact and nothing to collide with.

   Output is committed, not built on deploy — public/ is served statically and
   the sources change perhaps twice a year. Re-run after editing schematics-src:

     npm run schematics

   ==========================================================================*/

import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "schematics-src");
const OUT = join(ROOT, "public", "schematics");

/* Each sheet's panels, in document order. `wrapper` is the layout div the sheet
   puts around its panels — 1–3 and 4–6 hang their page width off it, so the
   panel has to keep it or it renders full-bleed. The other two size the panel
   itself and need no wrapper. */
const SHEETS = [
  {
    file: "poshane-architecture-diagrams-1-3.html",
    wrapper: "wrap",
    panels: ["d1", "d2", "d3"],
  },
  {
    file: "poshane-diagrams-4-6-2.html",
    wrapper: "sheet",
    panels: ["d4", "d5", "d6"],
  },
  {
    file: "poshane-architecture-diagrams-7-9-12-2.html",
    wrapper: null,
    panels: ["d7", "d8", "d9", "d12"],
  },
  {
    file: "poshane-diagrams-10-11-13-14-15.html",
    wrapper: null,
    panels: ["d10", "d11", "d13", "d14", "d15"],
  },
  {
    file: "poshane-gis-schematics-g1-g6.html",
    wrapper: "wrap",
    panels: ["g1", "g2", "g3", "g4", "g5", "g6"],
  },
];

/* The step-through animation is already a self-contained document with its own
   layout. It is copied, not split. */
const STANDALONE = [
  { file: "poshane-data-flow-animation-v3.html", id: "flow" },
];

/* Reports height to the viewer so the iframe can be sized to its content and
   never shows an inner scrollbar — the diagrams run to 1955 units tall and a
   nested scroll region is unusable on a projector.

   Measured from the body box, NOT documentElement.scrollHeight. scrollHeight is
   floored at the viewport, so a diagram shorter than the iframe reports the
   iframe's own height back — the measurement becomes circular and the frame can
   only ever grow. The body box is content height, so short diagrams shrink the
   frame correctly and tall ones still expand it. */
const HEIGHT_REPORTER = `
<script>
(function () {
  var last = 0;
  function measure() {
    var body = document.body;
    if (!body) return 0;
    var box = body.getBoundingClientRect();
    var height = box.height;
    /* A trailing child's bottom margin can collapse out of the body box; take
       whichever is larger so nothing is clipped. */
    var tail = body.lastElementChild;
    if (tail) height = Math.max(height, tail.getBoundingClientRect().bottom - box.top);
    return Math.ceil(height) + 2;
  }
  function report() {
    var h = measure();
    if (!h || h === last) return;
    last = h;
    try { parent.postMessage({ type: "poshane-schematic-height", height: h }, "*"); } catch (e) {}
  }
  window.addEventListener("load", report);
  window.addEventListener("resize", report);
  if (window.ResizeObserver) new ResizeObserver(report).observe(document.body);
  setTimeout(report, 60);
  setTimeout(report, 400);
  report();
})();
</script>`;

/* Marks the document as framed before first paint, so the embed rules below
   apply without a flash of the standalone layout. Sits in <head> deliberately —
   deferring it to the end of <body> would show the duplicate heading first. */
const EMBED_MARKER = `
<script>if (window.self !== window.top) document.documentElement.className += " embedded";</script>`;

/* Applies only inside the viewer; opening a diagram in its own tab still gets
   the untouched print sheet.

   Two adjustments. The sheet's page margins are trimmed, since the frame
   supplies its own padding and the sheet's 36px top rule would double it. And
   the panel's own title block is hidden, because the viewer already renders the
   diagram number, title and specification reference above the iframe — left in,
   every diagram would announce itself twice. The lede stays: that is the
   specification's own prose, and it is the reason to read a panel rather than
   just look at it. */
const EMBED_CSS = `
<style>
  html, body { margin: 0; padding: 0; background: #F7F3E9; overflow-x: hidden; }
  .embedded .wrap, .embedded .sheet { padding-top: 4px !important; padding-bottom: 18px !important; }
  .embedded .panel { padding-top: 8px !important; margin-bottom: 0 !important;
    border-top: 0 !important; box-shadow: none !important; page-break-after: auto !important; }
  /* Duplicate title block. Direct children only, so the h3 subheadings inside
     diagrams 10 and 15 are untouched. */
  .embedded .panel > h2,
  .embedded .panel > .dnum,
  .embedded .panel > .dno,
  .embedded .panel > .eyebrow,
  .embedded .panel > .specref { display: none !important; }
  /* The animation's masthead, minus its language toggle, which stays usable. */
  .embedded header .t { display: none !important; }
  .embedded header { border-bottom: 0 !important; padding-bottom: 0 !important;
    justify-content: flex-end !important; }
</style>`;

function extractStyles(html) {
  const head = html.slice(0, html.indexOf("</head>"));
  const found = head.match(/<style\b[^>]*>[\s\S]*?<\/style>/gi);
  if (!found) throw new Error("no <style> block found in head");
  return found.join("\n");
}

function extractPanels(html) {
  /* Verified non-nested across all four sheets: <section> open and close counts
     match exactly, so a non-greedy match is unambiguous here. */
  const found = html.match(/<section\b[^>]*>[\s\S]*?<\/section>/gi);
  return found ?? [];
}

function document_(title, styles, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
${EMBED_MARKER}
${styles}
${EMBED_CSS}
</head>
<body>
${body}
${HEIGHT_REPORTER}
</body>
</html>
`;
}

mkdirSync(OUT, { recursive: true });
for (const stale of readdirSync(OUT)) {
  if (stale.endsWith(".html")) unlinkSync(join(OUT, stale));
}

let written = 0;

for (const sheet of SHEETS) {
  const html = readFileSync(join(SRC, sheet.file), "utf8");
  const styles = extractStyles(html);
  const panels = extractPanels(html);

  if (panels.length !== sheet.panels.length) {
    throw new Error(
      `${sheet.file}: expected ${sheet.panels.length} panels, found ${panels.length}. ` +
        `Update the panel list in SHEETS if the sheet was re-cut.`
    );
  }

  panels.forEach((panel, i) => {
    const id = sheet.panels[i];
    const body = sheet.wrapper
      ? `<div class="${sheet.wrapper}">\n${panel}\n</div>`
      : panel;
    writeFileSync(join(OUT, `${id}.html`), document_(`Poshane · ${id.toUpperCase()}`, styles, body), "utf8");
    written++;
  });
}

for (const one of STANDALONE) {
  const html = readFileSync(join(SRC, one.file), "utf8");
  /* Self-contained already — its own layout and controls are left alone, and
     only the embed hooks and the height reporter are injected. */
  const patched = html
    .replace("</head>", `${EMBED_MARKER}\n${EMBED_CSS}\n</head>`)
    .replace("</body>", `${HEIGHT_REPORTER}\n</body>`);
  writeFileSync(join(OUT, `${one.id}.html`), patched, "utf8");
  written++;
}

console.log(`split-schematics: wrote ${written} documents to public/schematics/`);
