import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Testimonials from '@/components/Testimonials';
import ProductGrid from '@/components/ProductGrid';
import { fetchProducts } from '@/lib/api';

export default async function Home() {
  const products = await fetchProducts();
  const headline = 'EcoBottle: Pure water. Zero guilt.';
  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 16 }}>
      <Hero title={headline.split(':')[0]} highlight={headline.split(':')[1]?.trim() || ''} />
      <ProductGrid products={products} />
      <Features />
      <Testimonials />
    </main>
  );
}


