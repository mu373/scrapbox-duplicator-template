import "jsr:@std/dotenv@0.225.6/load";
import { exportPages, importPages } from "./scrapbox.ts";

const sid = Deno.env.get("SID");
const exportingProjectName = Deno.env.get("SOURCE_PROJECT_NAME");
const importingProjectName = Deno.env.get("DESTINATION_PROJECT_NAME");
const exportJsonPath = Deno.env.get("EXPORT_JSON_PATH");
const shouldDuplicateByDefault =
  Deno.env.get("SHOULD_DUPLICATE_BY_DEFAULT") === "True";

if (!importingProjectName) {
  throw new Error("DESTINATION_PROJECT_NAME is required");
}

const getLineText = (line: string | { text: string }): string =>
  typeof line === "string" ? line : line.text;

// deno-lint-ignore no-explicit-any
let pages: any[];
if (exportJsonPath) {
  console.log(`Reading exported json from "${exportJsonPath}"...`);
  const parsed = JSON.parse(await Deno.readTextFile(exportJsonPath));
  pages = parsed.pages;
  console.log(`Loaded ${pages.length} pages from json.`);
} else {
  if (!sid) throw new Error("SID is required when not using EXPORT_JSON_PATH");
  if (!exportingProjectName) {
    throw new Error("SOURCE_PROJECT_NAME is required");
  }
  console.log(`Exporting a json file from "/${exportingProjectName}"...`);
  const result = await exportPages(exportingProjectName, {
    sid,
    metadata: true,
  });
  if (!result.ok) {
    throw result.value;
  }
  pages = result.value.pages;
  console.log(`Exported ${pages.length} pages.`);
}

const importingPages = pages.filter(({ lines }) => {
  if (
    lines.some((line: string | { text: string }) =>
      getLineText(line).includes("[private]")
    )
  ) {
    return false;
  } else if (
    lines.some((line: string | { text: string }) =>
      getLineText(line).includes("[public]")
    )
  ) {
    return true;
  } else {
    return shouldDuplicateByDefault;
  }
});

if (importingPages.length === 0) {
  console.log("No page to be imported found.");
} else {
  if (!sid) throw new Error("SID is required for importing pages");
  console.log(
    `Importing ${importingPages.length} pages to "/${importingProjectName}"...`,
  );
  const result = await importPages(importingProjectName, {
    pages: importingPages,
  }, {
    sid,
  });
  if (!result.ok) {
    throw result.value;
  }
  console.log(result.value);
}
