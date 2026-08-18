import { writeFile } from "node:fs/promises";
import { courses, resourceCatalog } from "../client/src/data/catalog.ts";

const payload = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  courses,
  resourceCatalog,
};

await writeFile(
  new URL("../client/src/data/curriculum.json", import.meta.url),
  `${JSON.stringify(payload, null, 2)}\n`,
  "utf8",
);
console.log(`Exported ${courses.length} courses and ${resourceCatalog.length} resources.`);
