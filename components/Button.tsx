import { cn } from "@/lib/utils";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "outline";
}

export const Button = ({
    className,
    variant = "primary",
    ...props
}: ButtonProps) => {
    const baseStyles =
        "px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2";
    const variants = {
        primary:
            "bg-elvion-primary text-black hover:bg-elvion-accent hover:shadow-[0_0_15px_rgba(0,210,141,0.5)]",
        outline:
            "border-2 border-elvion-primary text-elvion-primary hover:bg-elvion-primary hover:text-black",
    };

    return (
        <button
            className={cn(baseStyles, variants[variant], className)}
            {...props}
        />
    );
};

