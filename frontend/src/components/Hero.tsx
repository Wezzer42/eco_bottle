"use client";
import { memo } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

type HeroProps = {
  title?: string;
  highlight?: string;
  subtitle?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
};

const BOTTLE_PATH =
  "M160 30c18 0 28 10 28 24v28c20 18 32 44 32 72v168c0 33-27 60-60 60H100c-33 0-60-27-60-60V154c0-28 12-54 32-72V54c0-14 10-24 28-24h60z";

function HeroInner({
  title = "Hydrate",
  highlight = "Sustainably",
  subtitle = "Premium eco-friendly water bottles designed for real life.",
  ctaLabel = "Shop Now",
  onCtaClick
}: HeroProps) {
  const reduce = useReducedMotion();
  const fade: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } }
  };

  return (
    <section
      id="home"
      className="relative min-h-[70vh] flex items-center bg-gradient-to-br from-blue-50 to-emerald-50 overflow-hidden"
      aria-label="EcoBottle hero"
    >
      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div initial="hidden" animate="show" variants={fade} className="space-y-6">
          <h1 className="text-4xl md:text-6xl leading-tight font-bold">
            {title}{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              {highlight}
            </span>
          </h1>
          {subtitle && <p className="text-lg text-gray-600 max-w-lg">{subtitle}</p>}
          <Button
            onClick={onCtaClick}
            className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            {ctaLabel}
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* SVG bottle with animated water */}
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative flex justify-center"
        >
          <div className="relative w-full max-w-[420px] aspect-[4/5]">
            <svg viewBox="0 0 280 360" className="absolute inset-0 w-full h-full">
              <defs>
                <clipPath id="hero-bottle-clip"><path d={BOTTLE_PATH} /></clipPath>
                <linearGradient id="plastic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8ed0ff" />
                  <stop offset="100%" stopColor="#76bff0" />
                </linearGradient>
                <linearGradient id="water1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5aa7ff" />
                  <stop offset="100%" stopColor="#3f8ae0" />
                </linearGradient>
                <linearGradient id="water2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#78bbff" />
                  <stop offset="100%" stopColor="#539de9" />
                </linearGradient>
              </defs>

              <path d={BOTTLE_PATH} fill="url(#plastic)" />

              <g clipPath="url(#hero-bottle-clip)">
                <motion.g
                  initial={{ y: 220 }}
                  animate={{ y: reduce ? 220 : [220, 60, 220] }}
                  transition={{ duration: 6, repeat: Infinity, ease: [0.45, 0, 0.55, 1] as const }}
                >
                  <path
                    d="M-200 120 Q -150 100 -100 120 T 0 120 T 100 120 T 200 120 V 360 H -200 Z"
                    className="wave wave-a"
                    fill="url(#water1)"
                  />
                  <path
                    d="M-200 130 Q -150 150 -100 130 T 0 130 T 100 130 T 200 130 V 360 H -200 Z"
                    className="wave wave-b"
                    fill="url(#water2)"
                  />
                </motion.g>
              </g>

              <path d={BOTTLE_PATH} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="2" />
              <path d={BOTTLE_PATH} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" style={{ mixBlendMode: "screen" }} />
            </svg>

            {!reduce && (
              <>
                <motion.div
                  aria-hidden
                  animate={{ y: [-8, 8, -8] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-6 -right-6 w-16 h-16 bg-emerald-200 rounded-full opacity-60"
                />
                <motion.div
                  aria-hidden
                  animate={{ y: [8, -8, 8] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-4 -left-4 w-12 h-12 bg-blue-200 rounded-full opacity-60"
                />
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export const Hero = memo(HeroInner);
export default Hero;

