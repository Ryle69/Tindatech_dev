import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "bg-[#F7F1C5] flex h-10 w-full border-b border-[#AB5005] px-3 py-2 text-base text-[#AB5005] file:border-0 file:bg-none file:text-sm file:font-medium file:text-[#C08555] placeholder:text-[#C08555] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
