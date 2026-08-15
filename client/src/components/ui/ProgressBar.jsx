import * as React from "react"
import { cn } from "../../lib/utils"
import { motion } from "framer-motion"

const ProgressBar = React.forwardRef(({ className, value = 0, max = 100, ...props }, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div
      ref={ref}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10", className)}
      {...props}
    >
      <motion.div
        className="h-full bg-primary-600 dark:bg-primary-500 transition-all"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  )
})
ProgressBar.displayName = "ProgressBar"

export { ProgressBar }
