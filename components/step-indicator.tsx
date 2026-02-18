"use client";

const STEPS = [
  { key: "shop", label: "Shop Details", num: "1" },
  { key: "kyc", label: "Verification", num: "2" },
  { key: "waiting", label: "Review", num: "3" },
] as const;

interface StepIndicatorProps {
  currentStep: string;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="mb-14 flex items-center justify-center gap-0">
      {STEPS.map((step, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-2.5">
              {/* Circle with number */}
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium transition-all duration-300 ${
                  isCompleted
                    ? "bg-brand text-foreground"
                    : isCurrent
                      ? "border-2 border-brand bg-brand-light text-foreground"
                      : "border border-border text-muted"
                }`}
              >
                {isCompleted ? (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  step.num
                )}
              </div>
              <span
                className={`text-[0.6875rem] tracking-wide ${
                  isCurrent
                    ? "font-semibold text-foreground"
                    : isCompleted
                      ? "font-medium text-foreground"
                      : "text-muted"
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div
                className={`mx-4 mb-6 h-[2px] w-16 rounded-full sm:mx-8 sm:w-24 transition-colors duration-300 ${
                  isCompleted ? "bg-brand" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
