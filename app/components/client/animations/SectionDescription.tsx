"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface SectionDescriptionProps {
  text?: string;
  html?: string;
  className?: string;
  direction?: "x" | "y";
  as?: "p" | "span" | "div";
  link?: string;
}

const tagMotion: Record<string, any> = {
  p: motion.p,
  span: motion.span,
  div: motion.div,
};

export default function SectionDescription({
  text,
  html,
  className = "",
  direction = "x",
  as = "p",
  link,
}: SectionDescriptionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const MotionTag = tagMotion[as];

  const content = (
    <MotionTag
      className={`text-description ${className}`}
      initial={{
        [direction]: direction === "x" ? "50px" : "25px",
        opacity: 0,
      }}
      animate={
        isInView
          ? { [direction]: "0px", opacity: 1 }
          : {
              [direction]: direction === "x" ? "50px" : "25px",
              opacity: 0.1,
            }
      }
      transition={{
        duration: 0.9,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      {...(html
        ? { dangerouslySetInnerHTML: { __html: html } }
        : { children: text })}
    />
  );

  return (
    <div ref={ref}>
      {link ? <Link href={link}>{content}</Link> : content}
    </div>
  );
}