"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { WelcomeStep } from "@/components/steps/welcome-step";
import { RegisterStep } from "@/components/steps/register-step";
import { VerifyStep } from "@/components/steps/verify-step";
import { ShopStep } from "@/components/steps/shop-step";
import { KycStep } from "@/components/steps/kyc-step";
import { WaitingStep } from "@/components/steps/waiting-step";
import { api } from "@/lib/api";
import type { Artisan, OnboardingStep } from "@/lib/types";

type FullStep = "welcome" | OnboardingStep;

function determineStep(
  artisan: Artisan | null,
  hasShop: boolean,
  kycStatus: string | null
): FullStep {
  if (!artisan) return "welcome";
  if (!artisan.emailVerified) return "verify";
  if (!hasShop) return "shop";
  if (!kycStatus || kycStatus === "PENDING") return "kyc";
  return "waiting";
}

export default function OnboardingPage() {
  const { artisan, setArtisan, loading: authLoading } = useAuth();
  const [step, setStep] = useState<FullStep>("welcome");
  const [email, setEmail] = useState("");
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    async function init() {
      if (authLoading) return;

      if (!artisan) {
        setStep("welcome");
        setInitializing(false);
        return;
      }

      setEmail(artisan.email);

      if (!artisan.emailVerified) {
        setStep("verify");
        setInitializing(false);
        return;
      }

      try {
        const shop = await api.get<{ id: string } | null>("/shop/me");
        const hasShop = !!shop;

        let kycStatus: string | null = null;
        if (hasShop) {
          try {
            const kyc = await api.get<{ status: string }>("/kyc/status");
            kycStatus = kyc.status;
          } catch {
            // No KYC yet
          }
        }

        setStep(determineStep(artisan, hasShop, kycStatus));
      } catch {
        setStep(determineStep(artisan, false, null));
      }

      setInitializing(false);
    }

    init();
  }, [artisan, authLoading]);

  if (authLoading || initializing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    );
  }

  return (
    <>
      {step === "welcome" && (
        <WelcomeStep onBegin={() => setStep("register")} />
      )}

      {step === "register" && (
        <RegisterStep
          onComplete={(newArtisan: Artisan) => {
            setArtisan(newArtisan);
            setEmail(newArtisan.email);
            setStep("verify");
          }}
        />
      )}

      {step === "verify" && (
        <VerifyStep
          email={email}
          onComplete={() => {
            // Email verified but no token yet — redirect to login to get tokens
            window.location.href = "/login?verified=true";
          }}
        />
      )}

      {step === "shop" && (
        <ShopStep
          artisanName={artisan?.fullName || "Artisan"}
          onComplete={() => setStep("kyc")}
          onSkip={() => { window.location.href = "/dashboard"; }}
        />
      )}

      {step === "kyc" && (
        <KycStep
          onComplete={() => setStep("waiting")}
          onBack={() => setStep("shop")}
          onSkip={() => { window.location.href = "/dashboard"; }}
        />
      )}

      {step === "waiting" && (
        <WaitingStep
          onApproved={() => {
            window.location.href = "/dashboard";
          }}
          onRejected={() => {
            setStep("kyc");
          }}
        />
      )}
    </>
  );
}
