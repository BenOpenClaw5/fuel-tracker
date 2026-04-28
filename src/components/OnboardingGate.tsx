"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useOnboarded } from "@/lib/hooks";

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const onboarded = useOnboarded();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!pathname) return;
    if (!onboarded && !pathname.startsWith("/onboarding")) {
      router.replace("/onboarding");
    }
  }, [onboarded, pathname, router]);

  return <>{children}</>;
}
