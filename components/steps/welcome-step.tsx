"use client";

interface WelcomeStepProps {
  onBegin: () => void;
}

export function WelcomeStep({ onBegin }: WelcomeStepProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl text-center">
        {/* Brand tag with yellow accent */}
        <span className="inline-block rounded-full border border-brand/40 bg-brand-light px-4 py-1.5 text-[0.6875rem] font-medium uppercase tracking-widest text-foreground">
          Artisan Onboarding
        </span>

        <h1 className="mt-7 font-serif text-4xl leading-tight sm:text-5xl">
          Share Your Craft
          <br />
          <span className="italic">
            with the{" "}
            <span className="decoration-brand underline decoration-[3px] underline-offset-4">
              World
            </span>
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-md text-[0.9375rem] leading-relaxed text-muted">
          Join our community of skilled artisans and bring your handcrafted
          treasures to customers who appreciate authentic craftsmanship.
        </p>

        {/* Steps preview with yellow accents */}
        <div className="mx-auto mt-12 max-w-sm">
          <div className="space-y-0">
            {[
              {
                num: "01",
                title: "Shop Details",
                desc: "Tell us about you and your craft",
              },
              {
                num: "02",
                title: "Upload Documents",
                desc: "Share identity & business documents",
              },
              {
                num: "03",
                title: "Verification",
                desc: "Our team reviews within 72 hours",
              },
            ].map((item, i) => (
              <div key={i} className="group flex items-start gap-5 py-4">
                <span className="mt-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-semibold text-foreground">
                  {item.num}
                </span>
                <div className="flex-1 border-t border-border pt-4 text-left">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-0.5 text-[0.8125rem] text-muted">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <button onClick={onBegin} className="btn-brand">
            Get Started
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </div>

        <p className="mt-6 text-xs text-muted">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-medium text-foreground underline underline-offset-2"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
