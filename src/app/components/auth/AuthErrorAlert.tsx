import { cva, type VariantProps } from "class-variance-authority";

const alertStyles = cva(
  "p-3 rounded-lg text-sm flex items-start gap-2",
  {
    variants: {
      intent: {
        error: "bg-red-50 text-red-500",
        success: "bg-green-50 text-green-600",
        warning: "bg-yellow-50 text-yellow-600",
        info: "bg-blue-50 text-blue-600",
      },
    },
    defaultVariants: {
      intent: "error",
    },
  }
);

interface AuthErrorAlertProps extends VariantProps<typeof alertStyles> {
  message: string;
  className?: string;
}

export default function AuthErrorAlert({ 
  message, 
  intent,
  className = "" 
}: AuthErrorAlertProps) {
  const iconMap = {
    error: "⚠️",
    success: "✅",
    warning: "⚠️",
    info: "ℹ️",
  };

  const icon = intent ? iconMap[intent] : iconMap.error;

  return (
    <div className={alertStyles({ intent, className })} role="alert">
      <span className="flex-shrink-0">{icon}</span>
      <span>{message}</span>
    </div>
  );
}
