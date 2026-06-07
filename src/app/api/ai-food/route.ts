import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 30;

const NutrientsSchema = z.object({
  calories: z.number().describe("kcal for the stated serving"),
  protein_g: z.number(),
  carbs_g: z.number(),
  fat_g: z.number(),
  fiber_g: z.number().nullable(),
  sugar_g: z.number().nullable(),
  added_sugar_g: z.number().nullable(),
  sat_fat_g: z.number().nullable(),
  trans_fat_g: z.number().nullable(),
  cholesterol_mg: z.number().nullable(),
  sodium_mg: z.number().nullable(),
  potassium_mg: z.number().nullable(),
});

const AiFoodSchema = z.object({
  name: z.string().describe("Concise food name, e.g. 'Italian sub sandwich'"),
  brand: z
    .string()
    .nullable()
    .describe("Restaurant/brand if identifiable, else null"),
  servingLabel: z
    .string()
    .describe("Human portion label, e.g. '6-inch sandwich' or '1 plate'"),
  servingGrams: z.number().describe("Approximate grams of that one serving"),
  nutrients: NutrientsSchema,
  confidence: z.enum(["low", "medium", "high"]),
  assumptions: z
    .string()
    .describe("One short sentence on portion/prep assumptions made"),
});

const BASE_RULES = `You are a nutrition estimator for a personal food tracker. Return nutrition for ONE serving of the food.
- calories, protein_g, carbs_g, fat_g are always required. Provide your best estimate even when uncertain.
- Fill micronutrients (fiber, sugar, sat fat, sodium, etc.) when you can reasonably infer them, otherwise null.
- All values are per the single serving described by servingLabel / servingGrams.
- Set confidence honestly: "high" for a clear label or a well-known packaged/chain item, "medium" for a recognizable dish with normal portion assumptions, "low" for vague descriptions or hard-to-judge photos.
- Keep "assumptions" to one short sentence describing portion size or prep you assumed.`;

const MODE_PROMPT: Record<string, string> = {
  describe: `${BASE_RULES}
Parse the user's text description into a single food entry. If it names a specific chain/restaurant item (e.g. "a 6 inch #3 from Jimmy John's", "Chipotle chicken bowl"), use known published nutrition for that item. If it names a quantity (e.g. "one serving of tortilla chips", "2 eggs"), size the serving accordingly.`,
  photo: `${BASE_RULES}
Estimate the food shown in this photo and the portion visible. Judge portion size from plate/container/utensil cues. If multiple foods are on the plate, return the combined meal as one entry and name it descriptively. State your portion assumption in "assumptions".`,
  label: `${BASE_RULES}
This image is a Nutrition Facts label. Transcribe the values for ONE serving EXACTLY as printed — do not estimate when the number is legible. Set servingLabel and servingGrams from the label's serving size (convert household measures to grams if grams aren't printed). Read the brand/product name from the package if visible. confidence should be "high" when the label is clearly legible.`,
};

interface Body {
  mode?: "describe" | "photo" | "label";
  text?: string;
  image?: string; // base64, no data: prefix
  mediaType?: string; // e.g. image/jpeg
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI is not configured. Set ANTHROPIC_API_KEY in the environment." },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const mode = body.mode ?? "describe";
  const system = MODE_PROMPT[mode] ?? MODE_PROMPT.describe;

  const content: Anthropic.ContentBlockParam[] = [];
  if (mode === "describe") {
    const text = (body.text ?? "").trim();
    if (!text) {
      return NextResponse.json({ error: "Describe what you ate." }, { status: 400 });
    }
    content.push({ type: "text", text: `Food: ${text}` });
  } else {
    if (!body.image) {
      return NextResponse.json({ error: "No image provided." }, { status: 400 });
    }
    const mediaType = (body.mediaType ?? "image/jpeg") as
      | "image/jpeg"
      | "image/png"
      | "image/webp"
      | "image/gif";
    content.push({
      type: "image",
      source: { type: "base64", media_type: mediaType, data: body.image },
    });
    if (body.text?.trim()) {
      content.push({ type: "text", text: `Extra context: ${body.text.trim()}` });
    } else {
      content.push({
        type: "text",
        text:
          mode === "label"
            ? "Read this nutrition label."
            : "Identify this food and estimate its nutrition.",
      });
    }
  }

  const client = new Anthropic({ apiKey });

  try {
    const msg = await client.messages.parse({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      thinking: { type: "disabled" },
      output_config: {
        effort: "low",
        format: zodOutputFormat(AiFoodSchema),
      },
      system,
      messages: [{ role: "user", content }],
    });

    const parsed = msg.parsed_output;
    if (!parsed) {
      return NextResponse.json(
        { error: "Could not read that — try a clearer photo or description." },
        { status: 422 },
      );
    }
    return NextResponse.json({ food: parsed });
  } catch (e) {
    const err = e as Error;
    const status =
      e instanceof Anthropic.RateLimitError
        ? 429
        : e instanceof Anthropic.APIError
          ? (e.status ?? 502)
          : 500;
    return NextResponse.json(
      { error: err.message || "AI request failed." },
      { status },
    );
  }
}
