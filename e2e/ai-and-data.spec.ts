import { test, expect, Page } from "@playwright/test";

async function seedOnboarded(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      "fuel.profile.v1",
      JSON.stringify({
        units: "imperial",
        sex: "m",
        heightCm: 178,
        weightKg: 79,
        activityLevel: "moderate",
        goal: "maintain",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }),
    );
    localStorage.setItem(
      "fuel.goals.v1",
      JSON.stringify({ calories: 2400, protein_g: 174, carbs_g: 270, fat_g: 60 }),
    );
    localStorage.setItem("fuel.onboarded.v1", "1");
    localStorage.setItem(
      "fuel.settings.v1",
      JSON.stringify({ theme: "light", units: "imperial" }),
    );
  });
}

test.describe("AI tracking + expanded data", () => {
  test("Add screen links to the AI tracker", async ({ page }) => {
    await seedOnboarded(page);
    await page.goto("/add?meal=lunch");
    const aiLink = page.getByRole("link", { name: /track with ai/i });
    await expect(aiLink).toBeVisible();
    await expect(aiLink).toHaveAttribute("href", /\/ai\?/);
  });

  test("AI page shows three input modes; Describe reveals a text box", async ({ page }) => {
    await seedOnboarded(page);
    await page.goto("/ai?meal=lunch");
    // Three mode tabs
    await expect(page.getByRole("button", { name: /^Food$/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Label$/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Describe$/ })).toBeVisible();
    // Default (Food) shows a capture target
    await expect(page.getByRole("button", { name: /take \/ choose photo/i })).toBeVisible();
    // Describe shows a textarea + estimate button
    await page.getByRole("button", { name: /^Describe$/ }).click();
    await expect(page.getByPlaceholder(/jimmy john/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /estimate/i })).toBeVisible();
  });

  test("/api/ai-food is wired and returns structured JSON", async ({ request }) => {
    // With no ANTHROPIC_API_KEY it returns 503 {error}; with a key it returns {food}.
    // Either way the route must respond with JSON, never crash.
    const res = await request.post("/api/ai-food", {
      data: { mode: "describe", text: "one medium banana" },
    });
    const body = (await res.json()) as { food?: unknown; error?: unknown };
    expect(res.status() === 200 || res.status() === 503 || res.status() === 429).toBeTruthy();
    expect("food" in body || "error" in body).toBeTruthy();
  });

  test("/api/search surfaces curated Chipotle items", async ({ request }) => {
    const res = await request.get("/api/search?q=chipotle+steak");
    expect(res.ok()).toBeTruthy();
    const data = (await res.json()) as {
      results: Array<{ source: string; brand?: string; name: string }>;
    };
    const top = data.results.slice(0, 4);
    expect(
      top.some((r) => r.brand === "Chipotle" && /steak/i.test(r.name)),
    ).toBeTruthy();
  });

  test("/api/search surfaces Great Value store-brand staples", async ({ request }) => {
    const res = await request.get("/api/search?q=great+value+peanut+butter");
    expect(res.ok()).toBeTruthy();
    const data = (await res.json()) as {
      results: Array<{ source: string; brand?: string; name: string }>;
    };
    expect(
      data.results.some(
        (r) => r.brand === "Great Value" && /peanut butter/i.test(r.name),
      ),
    ).toBeTruthy();
  });

  test("/api/search surfaces new whole foods (tilapia)", async ({ request }) => {
    const res = await request.get("/api/search?q=tilapia");
    expect(res.ok()).toBeTruthy();
    const data = (await res.json()) as {
      results: Array<{ source: string; name: string }>;
    };
    expect(
      data.results.slice(0, 3).some((r) => /tilapia/i.test(r.name)),
    ).toBeTruthy();
  });

  test("curated matches paint instantly while typing (no network wait)", async ({ page }) => {
    await seedOnboarded(page);
    // Block the search API so ONLY the instant client-side curated list can render.
    await page.route("**/api/search**", () => {
      /* never fulfill — hangs the network call */
    });
    await page.goto("/add?meal=lunch");
    await page.getByPlaceholder(/Search foods/i).fill("chipotle steak");
    // Result appears from the bundled catalog without any API response.
    await expect(
      page.locator("ul.divide-y > li").filter({ hasText: /steak/i }).first(),
    ).toBeVisible({ timeout: 4000 });
  });

  test("/api/search relevance: query tokens appear in result names", async ({ request }) => {
    const res = await request.get("/api/search?q=pork+ribs");
    expect(res.ok()).toBeTruthy();
    const data = (await res.json()) as { results: Array<{ name: string }> };
    // External results are filtered to contain the query tokens in the name,
    // so we should not be flooded with items missing "pork" or "ribs".
    const offTopic = data.results.filter(
      (r) => !/pork/i.test(r.name) && !/rib/i.test(r.name),
    );
    expect(offTopic.length).toBeLessThanOrEqual(3);
  });
});
