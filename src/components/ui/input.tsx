import * as React from "react";

import { cn } from "../../lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full min-w-0 rounded-lg border-2 border-gray-200 bg-white/90 backdrop-blur-sm px-4 py-2 text-base text-gray-900 placeholder-gray-500 shadow-md transition-all duration-200 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 hover:border-gray-300 hover:shadow-lg disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-300 aria-invalid:focus-visible:ring-red-500/20 aria-invalid:focus-visible:border-red-500",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
