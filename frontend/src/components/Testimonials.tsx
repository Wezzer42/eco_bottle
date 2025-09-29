"use client";
import { memo } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Star, Quote } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Environmental Scientist",
    avatar:
      "https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    content:
      "EcoBottle has completely changed how I think about hydration. The quality is outstanding and I love knowing I'm making a positive impact.",
    rating: 5
  },
  {
    id: 2,
    name: "Marcus Chen",
    role: "Fitness Coach",
    avatar:
      "https://images.unsplash.com/photo-1672685667592-0392f458f46f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    content:
      "I recommend EcoBottle to all my clients. It keeps drinks cold for hours and the build quality is incredible. Worth every penny!",
    rating: 5
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Travel Blogger",
    avatar:
      "https://images.unsplash.com/photo-1706025090794-7ade2c1b6208?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    content:
      "Perfect travel companion! Lightweight, durable, and the collapsible design saves so much space in my backpack. Love it!",
    rating: 5
  }
];

function clampStars(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(5, Math.round(n)));
}

function TestimonialsInner() {
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }
    }
  };

  const grid: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduce ? 0 : 0.08 }
    }
  };

  const card: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const } }
  };

  return (
    <section id="testimonials" className="py-20 bg-white" aria-labelledby="testimonials-title">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={container}
          className="text-center mb-16"
        >
          <h2 id="testimonials-title" className="text-3xl md:text-4xl mb-4 font-bold">
            What Our{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Customers
            </span>{" "}
            Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join thousands of happy customers who've made the switch to sustainable hydration.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={grid}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {testimonials.map((t) => {
            const stars = clampStars(t.rating as number);
            return (
              <motion.article
                key={t.id}
                variants={card}
                className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 relative"
                aria-label={`Testimonial from ${t.name}`}
              >
                <Quote className="w-8 h-8 text-emerald-400 mb-4 opacity-60" aria-hidden="true" />

                <p className="text-gray-700 mb-6 leading-relaxed">
                  “{t.content}”
                </p>

                <div className="flex items-center gap-2 mb-4" aria-label={`Rating: ${stars} out of 5`}>
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                  ))}
                  {stars < 5 &&
                    Array.from({ length: 5 - stars }).map((_, i) => (
                      <Star key={`o-${i}`} className="w-4 h-4 text-yellow-300" aria-hidden="true" />
                    ))}
                </div>

                <div className="flex items-center gap-4">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    width={96}
                    height={96}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{t.name}</h3>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export const Testimonials = memo(TestimonialsInner);
export default Testimonials;


