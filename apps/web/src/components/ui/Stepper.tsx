import { cn } from '@/lib/utils';

interface Step {
  label: string;
  completed?: boolean;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn('flex items-center justify-between w-full', className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep || step.completed;
        const isCurrent = index === currentStep;

        return (
          <div key={index} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-small font-bold transition-all duration-200',
                  isCompleted && 'bg-success text-text-inverse',
                  isCurrent && 'bg-accent text-text-inverse',
                  !isCompleted && 'bg-border text-text-secondary'
                )}
              >
                {isCompleted ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  'mt-2 text-caption font-medium',
                  isCurrent && 'text-accent',
                  isCompleted && 'text-success',
                  !isCompleted && 'text-text-secondary'
                )}
              >
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2 transition-colors duration-200',
                  isCompleted ? 'bg-success' : 'bg-border'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
