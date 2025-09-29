"use client";
import { memo } from "react";
import { motion, useReducedMotion, Variants } from "framer-motion";
import { Leaf, RotateCcw, Truck, Award } from "lucide-react";

type Feature = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
};

const features: Feature[] = [
  { icon: Leaf,       title: "Eco-friendly Materials", description: "Made from 100% sustainable materials that are safe for you and the planet." },
  { icon: RotateCcw,  title: "Reusable Design",        description: "Built to last with premium durability that reduces waste and saves money." },
  { icon: Truck,      title: "Fast Shipping",          description: "Free worldwide shipping on orders over $50. Carbon-neutral delivery options." },
  { icon: Award,      title: "Quality Guarantee",      description: "Lifetime warranty on all products. If it breaks, we'll replace it for free." }
];

function FeaturesInner() {
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const } }
  };

  return (
    <section id="features" className="py-20 bg-gradient-to-br from-emerald-50 to-blue-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={container}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl mb-4">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              EcoBottle
            </span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We're committed to creating the best sustainable hydration solutions for conscious consumers.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={container}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map(({ icon: Icon, title, description }) => (
            <motion.article key={title} variants={item} className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transition-transform duration-300 group-hover:scale-110">
                <Icon className="w-8 h-8 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-xl mb-3 group-hover:text-emerald-600 transition-colors">{title}</h3>
              <p className="text-gray-600 leading-relaxed">{description}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export const Features = memo(FeaturesInner);
export default Features;


