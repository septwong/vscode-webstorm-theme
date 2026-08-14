import { existsSync, readFileSync } from "node:fs";
import { resolve, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const manifestPath = resolve(root, "package.json");

function parseJsonc(source, filePath) {
  let withoutComments = "";
  let inString = false;
  let escaped = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const nextCharacter = source[index + 1];

    if (inString) {
      withoutComments += character;
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === '"') {
        inString = false;
      }
      continue;
    }

    if (character === '"') {
      inString = true;
      withoutComments += character;
      continue;
    }

    if (character === "/" && nextCharacter === "/") {
      index += 2;
      while (index < source.length && source[index] !== "\n") index += 1;
      withoutComments += "\n";
      continue;
    }

    if (character === "/" && nextCharacter === "*") {
      index += 2;
      while (
        index < source.length - 1 &&
        !(source[index] === "*" && source[index + 1] === "/")
      ) {
        if (source[index] === "\n") withoutComments += "\n";
        index += 1;
      }
      index += 1;
      continue;
    }

    withoutComments += character;
  }

  let normalized = "";
  inString = false;
  escaped = false;
  for (let index = 0; index < withoutComments.length; index += 1) {
    const character = withoutComments[index];
    if (inString) {
      normalized += character;
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === '"') {
        inString = false;
      }
      continue;
    }
    if (character === '"') {
      inString = true;
      normalized += character;
      continue;
    }
    if (character === ",") {
      let lookahead = index + 1;
      while (/\s/.test(withoutComments[lookahead] ?? "")) lookahead += 1;
      if (withoutComments[lookahead] === "}" || withoutComments[lookahead] === "]") {
        continue;
      }
    }
    normalized += character;
  }

  try {
    return JSON.parse(normalized);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${filePath}: invalid JSONC (${message})`);
  }
}

function fail(message) {
  throw new Error(`Theme validation failed: ${message}`);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const themeContributions = manifest.contributes?.themes;

if (!Array.isArray(themeContributions) || themeContributions.length === 0) {
  fail("package.json must declare at least one contributed theme");
}

const labels = new Set();
for (const contribution of themeContributions) {
  if (!contribution.label || !contribution.path) {
    fail("each contributed theme needs a label and path");
  }
  if (labels.has(contribution.label)) {
    fail(`duplicate theme label: ${contribution.label}`);
  }
  labels.add(contribution.label);

  const relativeThemePath = contribution.path.replace(/^\.\//, "");
  const themePath = resolve(root, relativeThemePath);
  const pathFromRoot = relative(root, themePath);
  if (
    pathFromRoot.startsWith(`..${sep}`) ||
    pathFromRoot === ".." ||
    !relativeThemePath.startsWith("themes/")
  ) {
    fail(`${contribution.label}: theme path must stay inside themes/`);
  }
  if (!existsSync(themePath)) {
    fail(`${contribution.label}: missing theme file ${contribution.path}`);
  }

  const theme = parseJsonc(readFileSync(themePath, "utf8"), contribution.path);
  if (theme.type !== "dark" && theme.type !== "light") {
    fail(`${contribution.label}: type must be dark or light`);
  }
  if (!theme.colors || typeof theme.colors !== "object" || Array.isArray(theme.colors)) {
    fail(`${contribution.label}: colors must be an object`);
  }
  if (theme.tokenColors !== undefined && !Array.isArray(theme.tokenColors)) {
    fail(`${contribution.label}: tokenColors must be an array when present`);
  }
  if (
    theme.semanticTokenColors !== undefined &&
    (typeof theme.semanticTokenColors !== "object" ||
      Array.isArray(theme.semanticTokenColors))
  ) {
    fail(`${contribution.label}: semanticTokenColors must be an object when present`);
  }
}

console.log(`Validated ${themeContributions.length} VS Code themes.`);
