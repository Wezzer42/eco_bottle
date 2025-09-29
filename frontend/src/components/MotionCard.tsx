"use client";
import { motion } from 'framer-motion';
import Image from 'next/image';
import WishlistButton from './WishlistButton';

type Props = { title: string; price: number; imageUrl: string; id?: number };

export default function MotionCard({ title, price, imageUrl, id }: Props) {
  return (
    <motion.article
      whileHover={{ y: -6, boxShadow: '0 12px 30px rgba(0,0,0,0.12)' }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      style={{ border: '1px solid #eee', borderRadius: 16, padding: 12, background: 'white' }}
    >
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', marginBottom: 8 }}>
        <Image src={imageUrl} alt={title} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'cover', borderRadius: 12 }} />
      </div>
      <h3 style={{ margin: 0, fontSize: 16 }}>{title}</h3>
      <p style={{ margin: '4px 0 8px 0', opacity: 0.8 }}>{(price / 100).toFixed(2)} USD</p>
      {typeof id === 'number' && (
        <WishlistButton 
          productId={id} 
          productName={title}
          className="w-full"
        />
      )}
    </motion.article>
  );
}

