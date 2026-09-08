"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ElementType } from "react";

gsap.registerPlugin(ScrollTrigger);

interface AnimatedTitleProps {
  text: string;
  className?: string;
  tag?: ElementType;
  skipIntroWait?: boolean;
}

export default function AnimatedTitle({
  text,
  className = "",
  tag = "h2",
  skipIntroWait = false,
}: AnimatedTitleProps) {
  const rootRef = useRef<HTMLHeadingElement>(null);
  const readyToAnimate = skipIntroWait;

  useLayoutEffect(() => {
    if (!rootRef.current || !readyToAnimate) return;

    const chars = rootRef.current.querySelectorAll(".animated-char");

    const ctx = gsap.context(() => {
      gsap.set(chars, {
        scale: 1,
        opacity: 0.4,
        transformOrigin: "50% 50%",
        willChange: "transform",
      });

      gsap.to(chars, {
        keyframes: [
          {
            scale: 1.18,
            opacity: 1,
            duration: 0.23,
            ease: "power2.out",
          },
          {
            scale: 1,
            duration: 0.35,
            ease: "power3.out",
          },
        ],
        stagger: {
          each: 0.028,
        },
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 85%",
          once: true,
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, [readyToAnimate]);

  const Tag = tag;
  const words = text.split(" ");

  return (
    <Tag ref={rootRef} className={className}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex}>
          <span className="inline-block" style={{ whiteSpace: "nowrap" }}>
            {word.split("").map((char, charIndex) => (
              <span key={charIndex} className="animated-char inline-block">
                {char}
              </span>
            ))}
          </span>
          {wordIndex < words.length - 1 && " "}
        </span>
      ))}
    </Tag>
  );
}
