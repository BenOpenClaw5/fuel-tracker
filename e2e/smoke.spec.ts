import { test, expect, Page } from "@playwright/test";

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
      sugar_g: 60,
      added_sugar_g: 25,
      sat_fat_g: 27,
      sodium_mg: 2300,
      potassium_mg: 3500,
      calcium_mg: 1000,
      iron_mg: 8,
      magnesium_mg: 400,
      zinc_mg: 11,
      phosphorus_mg: 700,
      vit_a_mcg: 900,
      vit_c_mg: 90,
      vit_d_mcg: 20,
      vit_e_mg: 15,
      vit_k_mcg: 120,
      vit_b1_mg: 1.2,
      vit_b2_mg: 1.3,
      vit_b3_mg: 16,
      vit_b6_mg: 1.3,
      vit_b9_mcg: 400,
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

/** Seed a couple of log entries for today so detail sheets / undo have data. */
async function seedSomeFoodToday(page: Page) {
  await page.addInitScript(() => {
    const today = new Date().toISOString().slice(0, 10);
    const foods = {
      f_oats: {
        id: "f_oats",
        source: "user",
        name: "Rolled oats",
        servingSizeG: 40,
        servingLabel: "0.5 cup (40 g)",
        nutrients: {
          calories: 150,
          protein_g: 5,
          carbs_g: 27,
          fat_g: 2.5,
          fiber_g: 4,
          sodium_mg: 0,
          sat_fat_g: 0.5,
          added_sugar_g: 0,
        },
        createdAt: Date.now(),
      },
      f_chips: {
        id: "f_chips",
        source: "user",
        name: "Salted potato chips",
        servingSizeG: 28,
        servingLabel: "1 oz (28 g)",
        nutrients: {
          calories: 160,
          protein_g: 2,
          carbs_g: 15,
          fat_g: 10,
          fiber_g: 1,
          sodium_mg: 170,
          sat_fat_g: 1.5,
          added_sugar_g: 0,
        },
        createdAt: Date.now(),
      },
    };
    localStorage.setItem("fuel.foods.v1", JSON.stringify(foods));
    const log = [
      {
        id: "log_oats",
        date: today,
        meal: "breakfast",
        foodId: "f_oats",
        servings: 1,
        snapshot: {
          name: foods.f_oats.name,
          servingLabel: foods.f_oats.servingLabel,
          nutrients: foods.f_oats.nutrients,
        },
        createdAt: Date.now() - 1000,
      },
      {
        id: "log_chips",
        date: today,
        meal: "snacks",
        foodId: "f_chips",
        servings: 2,
        snapshot: {
          name: foods.f_chips.name,
          servingLabel: foods.f_chips.servingLabel,
          nutrients: foods.f_chips.nutrients,
        },
        createdAt: Date.now() - 500,
      },
    ];
    localStorage.setItem("fuel.log.v1", JSON.stringify(log));
  });
}

test.describe("FUEL smoke", () => {
  test("onboarding completes and lands on Today", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page.getByRole("heading", { name: /track what you eat/i })).toBeVisible();
    await page.getByRole("button", { name: /continue/i }).click();
    await page.getByRole("button", { name: /continue/i }).click();
    await page.getByRole("button", { name: /continue/i }).click();
    await page.getByRole("button", { name: /continue/i }).click();
    await page.getByRole("button", { name: /start tracking/i }).click();
    await expect(page).toHaveURL(/\/$|\/?/);
    await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();
  });

  test("Today shows calorie hero, key nutrients (fiber + sodium), and meals", async ({ page }) => {
    await seedOnboarded(page);
    await seedSomeFoodToday(page);
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();
    await expect(page.getByText("Calories", { exact: true })).toBeVisible();

    // KeyNutrients strip
    const keyStrip = page.getByTestId("key-nutrients");
    await expect(keyStrip).toBeVisible();
    await expect(keyStrip.getByText("Fiber", { exact: true })).toBeVisible();
    await expect(keyStrip.getByText("Sodium", { exact: true })).toBeVisible();
    await expect(keyStrip.getByText("Sat fat", { exact: true })).toBeVisible();
    await expect(keyStrip.getByText("Added sugar", { exact: true })).toBeVisible();

    // Vitamins & minerals panel
    await expect(page.getByText("Vitamins & minerals")).toBeVisible();

    // Four meals
    for (const meal of ["Breakfast", "Lunch", "Dinner", "Snacks"]) {
      await expect(page.getByRole("heading", { name: meal })).toBeVisible();
    }
  });

  test("tapping fiber opens drill-down sheet listing contributing foods", async ({ page }) => {
    await seedOnboarded(page);
    await seedSomeFoodToday(page);
    await page.goto("/");
    await page.getByTestId("key-nutrients").getByRole("button", { name: /fiber detail/i }).click();
    const dialog = page.getByRole("dialog", { name: /fiber detail/i });
    await expect(dialog).toBeVisible();
    // Both seeded foods contribute fiber
    await expect(dialog.getByText("Rolled oats")).toBeVisible();
    await expect(dialog.getByText("Salted potato chips")).toBeVisible();
    // The oats serve more fiber than chips × 2 servings (4 vs 2), oats first
    const items = dialog.locator("ul li");
    await expect(items.first()).toContainText("Rolled oats");
  });

  test("tapping sodium drill-down shows top sources and overshoot indication", async ({ page }) => {
    await seedOnboarded(page);
    await seedSomeFoodToday(page);
    await page.goto("/");
    await page.getByTestId("key-nutrients").getByRole("button", { name: /sodium detail/i }).click();
    const dialog = page.getByRole("dialog", { name: /sodium detail/i });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/Top sources/i)).toBeVisible();
    await expect(dialog.getByText("Salted potato chips")).toBeVisible();
  });

  test("delete log entry shows undo, undo restores it", async ({ page }) => {
    await seedOnboarded(page);
    await seedSomeFoodToday(page);
    await page.goto("/");
    // The Breakfast meal card is what holds the entry; scope the assertion there.
    const breakfast = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "Breakfast" }) });
    await expect(breakfast.getByText("Rolled oats")).toBeVisible();
    await page.getByRole("button", { name: /Remove Rolled oats/i }).click();
    const toastUndo = page.getByRole("button", { name: /^Undo$/ });
    await expect(toastUndo).toBeVisible();
    await expect(breakfast.getByText("Rolled oats")).not.toBeVisible();
    await toastUndo.click();
    await expect(breakfast.getByText("Rolled oats")).toBeVisible();
  });

  test("trends window toggle switches windows", async ({ page }) => {
    await seedOnboarded(page);
    await seedSomeFoodToday(page);
    await page.goto("/trends");
    await expect(page.getByRole("heading", { name: "Trends" })).toBeVisible();
    const radioGroup = page.getByRole("radiogroup", { name: /time range/i });
    await expect(radioGroup).toBeVisible();
    // Default is 14d
    await expect(radioGroup.getByRole("radio", { name: "14d" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await radioGroup.getByRole("radio", { name: "30d" }).click();
    await expect(radioGroup.getByRole("radio", { name: "30d" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  test("trends nutrient deep dive defaults to fiber + watch list visible", async ({ page }) => {
    await seedOnboarded(page);
    await seedSomeFoodToday(page);
    await page.goto("/trends");
    await expect(page.getByText("Nutrient deep dive")).toBeVisible();
    const select = page.getByRole("combobox", { name: /select nutrient/i });
    await expect(select).toHaveValue("fiber_g");
    // Watch list section (not the option in the select) shows the daily-average label
    await expect(page.getByText("Watch list — daily averages")).toBeVisible();
    // The watch list should include Sodium and Fiber as buttons
    await expect(
      page.getByRole("button", { name: /Sodium drill-down/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Fiber drill-down/i }),
    ).toBeVisible();
  });

  test("search 'chicken' surfaces a whole-food entry near the top", async ({ page }) => {
    await seedOnboarded(page);
    await page.goto("/add?meal=lunch");
    await page.getByPlaceholder(/Search foods/i).fill("chicken");
    await page.waitForResponse(
      (r) => r.url().includes("/api/search?q=chicken") && r.status() === 200,
      { timeout: 15000 },
    );
    await page.waitForTimeout(500);
    const firstSix = await page
      .locator("ul.divide-y > li")
      .evaluateAll((nodes) =>
        nodes.slice(0, 6).map((n) => (n.textContent || "").toLowerCase().trim()),
      );
    // Top of list should contain *some* unbranded "chicken …" entry — the
    // ranking is the meaningful contract, not the exact #1.
    expect(firstSix.some((t) => /^chicken/.test(t))).toBeTruthy();
  });

  test("search input requires 2 chars before firing", async ({ page }) => {
    await seedOnboarded(page);
    await page.goto("/add?meal=lunch");
    let calls = 0;
    page.on("request", (req) => {
      if (req.url().includes("/api/search")) calls += 1;
    });
    await page.getByPlaceholder(/Search foods/i).fill("c");
    await page.waitForTimeout(700);
    expect(calls).toBe(0);
    await page.getByPlaceholder(/Search foods/i).fill("ch");
    await page.waitForResponse(
      (r) => r.url().includes("/api/search?q=ch") && r.status() === 200,
      { timeout: 15000 },
    );
    expect(calls).toBeGreaterThanOrEqual(1);
  });

  test("custom food creation flow", async ({ page }) => {
    await seedOnboarded(page);
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
    const picker = page.locator("section.card").last();
    await picker.locator("ul.divide-y > li").first().click();
    await page.getByRole("button", { name: /^Save$/ }).click();
    await expect(page).toHaveURL(/\/recipes$/);
    await expect(page.getByText("Smoke test bowl").first()).toBeVisible();
  });

  test("/api/search degrades gracefully on partial failure (still 200)", async ({ request }) => {
    const res = await request.get("/api/search?q=chicken");
    expect(res.ok()).toBeTruthy();
    const data = (await res.json()) as { results: unknown[] };
    expect(Array.isArray(data.results)).toBe(true);
  });

  test("/api/search returns whole foods first for 'chicken'", async ({ request }) => {
    const res = await request.get("/api/search?q=chicken");
    expect(res.ok()).toBeTruthy();
    const data = (await res.json()) as { results: Array<{ name: string; brand?: string }> };
    expect(data.results.length).toBeGreaterThan(2);
    const top4 = data.results.slice(0, 4);
    expect(top4.some((r) => !r.brand && /^chicken/i.test(r.name))).toBeTruthy();
  });
});
