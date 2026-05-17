'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useState } from 'react';
import { Spinner } from '@/components/ui/spinner';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    imageUrl: string;
    stock: number;
    rating?: number;
    category?: {
      name: string;
      slug: string;
    };
    vendorName?: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (user.role !== 'customer') {
      toast.error('Only customers can add items to cart');
      return;
    }

    setIsAdding(true);
    const result = await api.addToCart(product._id, 1);
    setIsAdding(false);

    if (result.success) {
      toast.success(`${product.name} added to cart`);
    } else {
      toast.error(result.error || 'Failed to add to cart');
    }
  };

  return (
    <Link href={`/products/${product._id}`}>
      <Card className="group overflow-hidden h-full hover:shadow-lg transition-shadow">
        <div className="aspect-square relative overflow-hidden bg-muted">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Badge variant="secondary">Out of Stock</Badge>
            </div>
          )}
          {product.category && (
            <Badge className="absolute top-2 left-2" variant="secondary">
              {product.category.name}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
          {product.vendorName && (
            <p className="text-sm text-muted-foreground mt-1">{product.vendorName}</p>
          )}
          <div className="flex items-center justify-between mt-2">
            <span className="text-lg font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
            {product.rating !== undefined && product.rating > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button
            className="w-full"
            disabled={product.stock === 0 || isAdding}
            onClick={handleAddToCart}
          >
            {isAdding ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
