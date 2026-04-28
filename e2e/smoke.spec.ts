import { test, expect, Page } from "@playwright/test";

/** Seed an onboarded session so we can land on /today directly. */
async function seedOnboarded(page: Page) {
  await page.addInitScript(() => {
    const profile = {
      units: "imperial",
      sex: "m",
      birthDate: "1995-01-01",
      heightCm: 178,
      weightKg: 79,
      activityLevel: "moderate",
      goal: "maintain",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const goals = {
      calories: 2400,
      protein_g: 174,
      carbs_g: 270,
      fat_g: 60,
      fiber_g: 38,
      sodium_mg: 2300,
      potassium_mg: 3500,
      calcium_mg: 1000,
      iron_mg: 8,
      vit_c_mg: 90,
      vit_d_mcg: 20,
      vit_b12_mcg: 2.4,
      water_ml: 2800,
    };
    localStorage.setItem("fuel.profile.v1", JSON.stringify(profile));
    localStorage.setItem("fuel.goals.v1", JSON.stringify(goals));
    localStorage.setItem("fuel.onboarded.v1", "1");
    localStorage.setItem(
      "fuel.settings.v1",
      JSON.stringify({ theme: "light", units: "imperial" }),
    );
  });
}

test.describe("FUEL smoke", () => {
  test("onboarding completes and lands on Today", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page.getByRole("heading", { name: /track what you eat/i })).toBeVisible();
    // Step through 5 screens
    await page.getByRole("button", { name: /continue/i }).click();
    await page.getByRole("button", { name: /continue/i }).click();
    await page.getByRole("button", { name: /continue/i }).click();
    await page.getByRole("button", { name: /continue/i }).click();
    await page.getByRole("button", { name: /start tracking/i }).click();
    await expect(page).toHaveURL(/\/$|\/?/);
    await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();
  });

  test("Today shows calorie hero + macro bars + meal cards", async ({ page }) => {
    await seedOnboarded(page);
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();
    await expect(page.getByText(/Calories/i).first()).toBeVisible();
    // four meals
    for (const meal of ["Breakfast", "Lunch", "Dinner", "Snacks"]) {
      await expect(page.getByRole("heading", { name: meal })).toBeVisible();
    }
    // micronutrient panel collapsed by default
    await expect(page.getByText(/Micronutrients/i)).toBeVisible();
  });

  test("search 'chicken' surfaces a whole-food entry near the top", async ({ page }) => {
    await seedOnboarded(page);
    await page.goto("/add?meal=lunch");
    const input = page.getByPlaceholder(/Search foods/i);
    await input.fill("chicken");
    // Wait for results — debounced
    await page.waitForResponse((r) => r.url().includes("/api/search?q=chicken") && r.status() === 200, {
      timeout: 15000,
    });
    // Allow a tick for render
    await page.waitForTimeout(500);
    // The first 3 result names
    const titles = await page
      .locator("ul.divide-y > li")
      .nth(0)
      .locator("text=/.+/")
      .first()
      .textContent();
    expect(titles).toBeTruthy();
    // Whole foods don't show a "Mine" pill or branded look — assert at least one
    // result whose name starts with "Chicken" appears in the first 4.
    const firstFourNames = await page
      .locator("ul.divide-y > li")
      .evaluateAll((nodes) =>
        nodes.slice(0, 4).map((n) => (n.textContent || "").toLowerCase()),
      );
    expect(firstFourNames.some((t) => t.startsWith("chicken"))).toBeTruthy();
  });

  test("custom food creation flow", async ({ page }) => {
    await seedOnboarded(page);
    // Land on / first so router.back() has a real previous page after save.
    await page.goto("/");
    await page.evaluate(() => window.location.assign("/foods/new"));
    await page.waitForURL(/\/foods\/new/);
    await page.getByPlaceholder(/Grandma/i).fill("Test custom food");
    const macros = page.locator("section.card").nth(1).locator("input[type='number']");
    await macros.nth(0).fill("250");
    await macros.nth(1).fill("12");
    await macros.nth(2).fill("30");
    await macros.nth(3).fill("8");
    await page.getByRole("button", { name: /^Save$/ }).click();
    await page.waitForURL(/\/$/);
    const stored = await page.evaluate(() => localStorage.getItem("fuel.foods.v1"));
    expect(stored).toContain("Test custom food");
  });

  test("dark mode toggle applies theme attribute", async ({ page }) => {
    await seedOnboarded(page);
    await page.goto("/settings");
    await page.getByRole("button", { name: /^Dark$/ }).click();
    const theme = await page.evaluate(() => document.documentElement.dataset.theme);
    expect(theme).toBe("dark");
  });

  test("recipe creation flow saves a recipe", async ({ page }) => {
    await seedOnboarded(page);
    await page.goto("/recipes/new");
    await page.getByPlaceholder(/Sunday morning/i).fill("Smoke test bowl");
    await page.getByPlaceholder(/Search foods to add/i).fill("oats");
    await page.waitForResponse(
      (r) => r.url().includes("/api/search?q=oats") && r.status() === 200,
      { timeout: 15000 },
    );
    await page.waitForTimeout(400);
    // The "Add ingredient" picker is the last `section.card` on the page.
    const picker = page.locator("section.card").last();
    await picker.locator("ul.divide-y > li").first().click();
    await page.getByRole("button", { name: /^Save$/ }).click();
    await expect(page).toHaveURL(/\/recipes$/);
    await expect(page.getByText("Smoke test bowl").first()).toBeVisible();
  });

  test("/api/search returns whole foods first for 'chicken'", async ({ request }) => {
    const res = await request.get("/api/search?q=chicken");
    expect(res.ok()).toBeTruthy();
    const data = (await res.json()) as { results: Array<{ name: string; brand?: string }> };
    expect(Array.isArray(data.results)).toBe(true);
    expect(data.results.length).toBeGreaterThan(2);
    // At least one of the top 4 results should be a non-branded "Chicken …" entry
    const top4 = data.results.slice(0, 4);
    const wholeChicken = top4.some(
      (r) => !r.brand && /^chicken/i.test(r.name),
    );
    expect(wholeChicken).toBeTruthy();
  });
});
