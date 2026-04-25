import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", ...props }, ref) => {
        const variants = {
            primary: "bg-[#0d6efd] hover:bg-[#0b5ed7] text-white shadow-sm",
            secondary: "bg-white border border-[#e5e7eb] text-[#111827] hover:bg-slate-50 shadow-sm",
            outline: "border border-[#0d6efd] text-[#0d6efd] hover:bg-blue-50",
            ghost: "hover:bg-slate-100 text-[#6b7280] hover:text-[#111827]",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
                    variants[variant],
                    className
                )}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";

export { Button };
