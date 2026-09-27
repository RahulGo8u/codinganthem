import { expect, test } from "@playwright/test";
import { SCHEMA_SAMPLE, buildSchemaArtifact } from "../lib/jsonSchema";
import { assertToolHeading, expectHighlightedOutputMatches, gotoTool } from "./helpers/toolPage";

const sample = JSON.parse(SCHEMA_SAMPLE);
const options = {
  title: "User",
  description: "Look up a user.",
  functionName: "lookup_user",
  detectFormats: true,
  requireProperties: true,
  rejectExtraProperties: true,
};

test.describe("JSON Schema generator", () => {
  test("infers formats and provider tool definitions", () => {
    const schema = buildSchemaArtifact(sample, "json-schema", options);
    expect(schema.code).toContain("https://json-schema.org/draft/2020-12/schema");
    expect(schema.code).toContain('"format": "uuid"');
    expect(schema.code).toContain('"format": "email"');
    expect(schema.code).toContain('"type": "integer"');

    const openai = buildSchemaArtifact(sample, "openai", options);
    expect(openai.code).toContain('"strict": true');
    expect(openai.code).toContain('"additionalProperties": false');
    expect(openai.filename).toBe("openai-tool.json");

    const anthropic = buildSchemaArtifact(sample, "anthropic", options);
    expect(anthropic.code).toContain('"input_schema"');

    const gemini = buildSchemaArtifact(sample, "gemini", options);
    expect(gemini.code).toContain('"parameters"');

    const zod = buildSchemaArtifact(sample, "zod", options);
    expect(zod.code).toContain('z.string().email()');
    expect(zod.code).toContain("export type User");

    const python = buildSchemaArtifact(sample, "python", options);
    expect(python.code).toContain("class User(TypedDict):");
    expect(python.code).toContain("email: str  # format: email");
  });

  test("builds a schema from the sample in the browser", async ({ page }) => {
    await gotoTool(page, "json-schema-generator");
    await assertToolHeading(page, "JSON Schema Generator");
    await page.getByRole("button", { name: "Load sample" }).click();
    await expectHighlightedOutputMatches(page, /json-schema\.org\/draft\/2020-12/);
    await expectHighlightedOutputMatches(page, /"format": "uuid"/);

    await page.getByRole("button", { name: "OpenAI", exact: true }).click();
    await expectHighlightedOutputMatches(page, /"strict": true/);
    await expectHighlightedOutputMatches(page, /lookup_user/);
  });
});
