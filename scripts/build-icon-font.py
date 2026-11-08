"""Self-hosted Font Awesome 6.4.0, cut down to the icons this site names.

Run again after adding icons that are not in public/fonts/fa/fa.css yet:
  1. Download from https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/ into one folder:
     css/all.css and webfonts/fa-solid-900.woff2, fa-regular-400.woff2,
     fa-brands-400.woff2, fa-v4compatibility.woff2
  2. pip install fonttools brotli
  3. python scripts/build-icon-font.py <that folder> .
  4. Bump the ?v= number on /fonts/fa/fa.css in index.html (browsers cache it for 30 days).
An icon is kept when its name appears anywhere in src/ as a word, so names
built at runtime (`fa-${icon}`) are covered as long as the word is in the code.
"""
import re, sys, os, glob, subprocess
fa, repo = sys.argv[1], sys.argv[2]
css = open(f"{fa}/all.css").read()
brands_start = css.index("--fa-style-family-brands")
rule = re.compile(r'((?:\.fa-[a-z0-9-]+::?before,?\s*)+)\{\s*content:\s*"\\([0-9a-f]+)";\s*\}', re.S)

# every word-like token in the source code (icon names may be built at runtime)
words = set()
files = [f for f in glob.glob(f"{repo}/src/**/*", recursive=True) if f.endswith((".js", ".jsx", ".ts", ".tsx", ".css"))]
files += [f"{repo}/index.html"]
for f in files:
    for t in re.findall(r"[a-z0-9]+(?:-[a-z0-9]+)*", open(f, encoding="utf-8", errors="ignore").read()):
        words.add(t[3:] if t.startswith("fa-") else t)

keep_solid, keep_brand, kept_names = set(), set(), set()
def keep_rule(m):
    names = re.findall(r"\.fa-([a-z0-9-]+)::?before", m.group(1))
    cp = int(m.group(2), 16)
    brand = m.start() > brands_start
    if any(n in words for n in names):
        (keep_brand if brand else keep_solid).add(cp)
        kept_names.update(names)
        return m.group(0)
    return ""
# apply with position awareness
pieces, last = [], 0
for m in rule.finditer(css):
    pieces.append(css[last:m.start()]); pieces.append(keep_rule(m)); last = m.end()
pieces.append(css[last:]); out = "".join(pieces)

# fonts: local subset files, woff2 only
out = re.sub(r'url\("\.\./webfonts/(fa-[a-z0-9-]+)\.woff2"\) format\("woff2"\), url\("\.\./webfonts/[^"]+\.ttf"\) format\("truetype"\)',
             lambda m: f'url("/fonts/fa/{m.group(1)}.woff2") format("woff2")', out)
# swap, not block: index.html hides the icons itself until their font has
# loaded (so no empty boxes show), and the rest of the page never waits.
out = out.replace("font-display: block", "font-display: swap")
out = re.sub(r"/\*.*?\*/", "", out, flags=re.S)
out = re.sub(r"\s+", " ", out).replace(" {", "{").replace("{ ", "{").replace("; }", "}").replace(" }", "}")
out = re.sub(r"\}\s+", "}", out)
banner = "/* Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com (icons CC BY 4.0, fonts SIL OFL 1.1, code MIT). Cut down to the icons this site names; rebuild with scripts/build-icon-font.py. */\n"
open(f"{repo}/public/fonts/fa/fa.css", "w").write(banner + out)

def subset(src, cps, dst):
    uni = ",".join(f"U+{c:04X}" for c in sorted(cps))
    subprocess.run([os.path.join(os.path.dirname(sys.executable), "pyftsubset"), src, f"--unicodes={uni}",
                    "--flavor=woff2", f"--output-file={dst}", "--layout-features=*", "--no-hinting"], check=True)
subset(f"{fa}/fa-solid-900.woff2", keep_solid, f"{repo}/public/fonts/fa/fa-solid-900.woff2")
try:
    subset(f"{fa}/fa-regular-400.woff2", keep_solid, f"{repo}/public/fonts/fa/fa-regular-400.woff2")
except subprocess.CalledProcessError:
    # this file does not parse for subsetting; it is small (25 KB) and only loads where a "far" icon is shown
    import shutil; shutil.copy(f"{fa}/fa-regular-400.woff2", f"{repo}/public/fonts/fa/fa-regular-400.woff2")
subset(f"{fa}/fa-brands-400.woff2", keep_brand, f"{repo}/public/fonts/fa/fa-brands-400.woff2")
import shutil; shutil.copy(f"{fa}/fa-v4compatibility.woff2", f"{repo}/public/fonts/fa/fa-v4compatibility.woff2")
print(f"icons kept: {len(kept_names)} names, solid/regular glyphs {len(keep_solid)}, brand glyphs {len(keep_brand)}")
for f in sorted(os.listdir(f"{repo}/public/fonts/fa")):
    print(f"  {os.path.getsize(f'{repo}/public/fonts/fa/{f}')//1024:4d} KB {f}")
