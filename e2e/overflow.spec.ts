import { test, expect, Page } from "@playwright/test";

async function seedOnboarded(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      "fuel.profile.v1",
      JSON.stringify({
        units: "imperial",
        sex: "m",
        birthDate: "1995-01-01",
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
      JSON.stringify({
        calories: 2400,
        protein_g: 174,
        carbs_g: 270,
        fat_g: 60,
        fiber_g: 38,
        sodium_mg: 2300,
        sat_fat_g: 27,
        added_sugar_g: 25,
        water_ml: 2800,
        potassium_mg: 3500,
        calcium_mg: 1000,
        iron_mg: 8,
        vit_c_mg: 90,
      }),
    );
    localStorage.setItem("fuel.onboarded.v1", "1");
    localStorage.setItem(
      "fuel.settings.v1",
      JSON.stringify({ theme: "light", units: "imperial" }),
    );
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(
      "fuel.water.v1",
      JSON.stringify({ [today]: { date: today, ml: 1500, updatedAt: Date.now() } }),
    );
    localStorage.setItem(
      "fuel.weight.v1",
      JSON.stringify([{ date: today, weightKg: 81.6, createdAt: Date.now() }]),
    );

    // Seed foods + recents + log entries to populate QuickAddStrip and meal cards
    const longName =
      "Tyson Air-Fried Frozen Chicken Breast Strips, Hand-Breaded";
    const foods = {
      f_oats: {
        id: "f_oats",
        source: "curated",
        name: "Rolled oats, dry",
        servingSizeG: 40,
        servingLabel: "0.5 cup dry (40 g)",
        nutrients: {
          calories: 152,
          protein_g: 5,
          carbs_g: 27,
          fat_g: 2.8,
          fiber_g: 4,
        },
        createdAt: Date.now(),
      },
      f_chips: {
        id: "f_chips",
        source: "off",
        brand: "Lay's",
        name: longName,
        servingSizeG: 28,
        servingLabel: "1 oz (28 g)",
        nutrients: {
          calories: 160,
          protein_g: 2,
          carbs_g: 15,
          fat_g: 10,
          sodium_mg: 170,
        },
        createdAt: Date.now(),
      },
    };
    localStorage.setItem("fuel.foods.v1", JSON.stringify(foods));
    localStorage.setItem(
      "fuel.recents.v1",
      JSON.stringify(["f_oats", "f_chips"]),
    );
    localStorage.setItem(
      "fuel.log.v1",
      JSON.stringify([
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
          createdAt: Date.now(),
        },
        {
          id: "log_chips",
          date: today,
          meal: "snacks",
          foodId: "f_chips",
          servings: 2,
          snapshot: {
            name: foods.f_chips.name,
            brand: foods.f_chips.brand,
            servingLabel: foods.f_chips.servingLabel,
            nutrients: foods.f_chips.nutrients,
          },
          createdAt: Date.now(),
        },
      ]),
    );
  });
}

// iPhone widths most users have. iPhone SE is the narrowest active model.
const WIDTHS = [320, 360, 375, 390, 414];

for (const width of WIDTHS) {
  test.describe(`mobile layout @${width}px`, () => {
    test.use({ viewport: { width, height: 812 } });

    test(`Today fits within ${width}px — no horizontal scroll`, async ({ page }) => {
      await seedOnboarded(page);
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const offenders = await page.evaluate(() => {
        const vpW = window.innerWidth;
        const out: Array<{ tag: string; cls: string; w: number; right: number; text: string }> = [];
        document.querySelectorAll("*").forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.right > vpW + 0.5 && r.width > 0) {
            const className =
              typeof el.className === "string" ? el.className : (el.getAttribute("class") ?? "");
            out.push({
              tag: el.tagName,
              cls: className.slice(0, 90),
              w: Math.round(r.width),
              right: Math.round(r.right),
              text: (el.textContent || "").slice(0, 50).trim(),
            });
          }
        });
        return { vpW, docW: document.documentElement.scrollWidth, offenders: out.slice(0, 8) };
      });

      if (offenders.offenders.length) {
        console.log(`@${width}px offenders:`, JSON.stringify(offenders, null, 2));
      }
      expect(offenders.docW, `docW must fit in ${width}px viewport`).toBeLessThanOrEqual(width);
    });
  });
}
