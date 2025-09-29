"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Props = {
  productId: number;
  productName: string;
  className?: string;
};

export default function WishlistButton({ productId, productName, className = "" }: Props) {
  const { data: session, status } = useSession();
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkWishlistStatus = useCallback(async () => {
    if (!session) return;
    
    try {
      const res = await fetch(`/api/backend/wishlist/check/${productId}`, {
        headers: { 'Authorization': `Bearer ${(session as typeof session & { apiAccessToken?: string }).apiAccessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInWishlist(data.inWishlist);
      }
    } catch (error) {
      console.error('Failed to check wishlist status:', error);
    }
  }, [session, productId]);

  // Проверяем статус wishlist при загрузке
  useEffect(() => {
    if (session) {
      checkWishlistStatus();
    }
  }, [session, productId, checkWishlistStatus]);

  async function toggleWishlist() {
    if (status === 'loading') return;
    
    if (!session) {
      toast.error("Please sign in to add items to your wishlist", {
        action: {
          label: "Sign in",
          onClick: () => {
            // Можно открыть модал авторизации или перейти на страницу входа
            window.location.hash = "#auth";
          },
        },
      });
      return;
    }

    setLoading(true);
    
    try {
      const method = inWishlist ? 'DELETE' : 'POST';
      const url = inWishlist 
        ? `/api/backend/wishlist/${productId}`
        : '/api/backend/wishlist';
      
      const body = inWishlist ? undefined : JSON.stringify({ productId });
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(session as typeof session & { apiAccessToken?: string }).apiAccessToken}`
        },
        body
      });

      if (res.ok) {
        setInWishlist(!inWishlist);
        
        if (inWishlist) {
          toast.success(`Removed "${productName}" from your wishlist`, {
            icon: "💔",
          });
        } else {
          toast.success(`Added "${productName}" to your wishlist!`, {
            icon: "❤️",
            action: {
              label: "View Wishlist",
              onClick: () => {
                window.location.href = "/profile#wishlist";
              },
            },
          });
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update wishlist');
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error("Failed to update wishlist. Please try again.", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant={inWishlist ? "default" : "outline"}
      size="sm"
      onClick={toggleWishlist}
      disabled={loading}
      className={`group transition-all duration-200 ${className}`}
      aria-label={inWishlist ? `Remove ${productName} from wishlist` : `Add ${productName} to wishlist`}
    >
      <Heart 
        className={`w-4 h-4 mr-2 transition-all duration-200 ${
          inWishlist 
            ? 'fill-white text-white' 
            : 'text-gray-600 group-hover:text-red-500'
        }`}
      />
      {loading ? "..." : inWishlist ? "In Wishlist" : "Add to Wishlist"}
    </Button>
  );
}
