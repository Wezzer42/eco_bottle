import MotionCard from './MotionCard';
type Product = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
  createdAt: string;
};

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
      {products.map(p => (
        <MotionCard key={p.id} id={p.id} title={p.name} price={p.price} imageUrl={p.imageUrl} />
      ))}
    </section>
  );
}

