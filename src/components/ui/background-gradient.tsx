"use client";
import { cn } from "~/lib/utils";
import React, { useMemo } from "react";
import { motion } from "framer-motion";

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
  colors = ["#00ccb1", "#7b61ff", "#ffc414", "#1ca0fb"],
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
  colors?: [string, string, string, string];
}) => {
  const variants = {
    initial: { backgroundPosition: "0 50%" },
    animate: { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] },
  };

  const gradient = useMemo(
    () =>
      `radial-gradient(circle farthest-side at 0 100%, ${colors[0]}, transparent),
       radial-gradient(circle farthest-side at 100% 0, ${colors[1]}, transparent),
       radial-gradient(circle farthest-side at 100% 100%, ${colors[2]}, transparent),
       radial-gradient(circle farthest-side at 0 0, ${colors[3]}, #141316)`,
    [colors]
  );

  return (
    <div className={cn("relative p-[1px] group", containerClassName)}>
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? { duration: 5, repeat: Infinity, repeatType: "reverse", ease: "linear" }
            : undefined
        }
        style={{
          backgroundImage: gradient,
          backgroundSize: animate ? "400% 400%" : undefined,
          opacity: 0.45,
          filter: "blur(8px)",
        }}
        className="absolute inset-0 rounded-3xl z-[2] opacity-80"
      />

      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? { duration: 5, repeat: Infinity, repeatType: "reverse", ease: "linear" }
            : undefined
        }
        style={{
          backgroundImage: gradient,
          backgroundSize: animate ? "400% 400%" : undefined,
        }}
        className="absolute inset-0 rounded-3xl z-[2]"
      />

      <div className={cn("relative z-[3]", className)}>{children}</div>
    </div>
  );
};
