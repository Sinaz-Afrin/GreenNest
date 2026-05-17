'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import useSWR from 'swr';

const fetcher = (url: string) => 
  fetch(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  }).then(res => res.json());

interface CartItem {
  product: {
    _id: string;
    name: string;
    price: number;
    imageUrl: string;
    stock: number;
    vendor: string;
  };
  quantity: number;
}

export default function CartPage() {
  const { data, isLoading, mutate } = useSWR('/api/cart', fetcher);
  const [updating, setUpdating] = useState<string | null>(null);

  const cartItems: CartItem[] = data?.cart?.items || [];

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0);

  const deliveryFee = cartItems.length > 0 ? 5.99 : 0;
  const total = subtotal + deliveryFee;

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    setUpdating(productId);
    const result = await api.updateCartItem(productId, newQuantity);
    setUpdating(null);

    if (result.success) {
      mutate();
    } else {
      toast.error(result.error || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (productId: string) => {
    setUpdating(productId);
    const result = await api.removeFromCart(productId);
    setUpdating(null);

    if (result.success) {
      toast.success('Item removed from cart');
      mutate();
    } else {
      toast.error(result.error || 'Failed to remove item');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add some plants to get started!</p>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.product?._id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {item.product?.imageUrl && (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{item.product?.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.product?.vendor}</p>
                      <p className="text-lg font-bold text-primary mt-1">
                        ${item.product?.price?.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdateQuantity(item.product?._id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updating === item.product?._id}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {updating === item.product?._id ? (
                            <Spinner className="h-4 w-4 mx-auto" />
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdateQuantity(item.product?._id, item.quantity + 1)}
                          disabled={item.quantity >= (item.product?.stock || 0) || updating === item.product?._id}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemoveItem(item.product?._id)}
                        disabled={updating === item.product?._id}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="border-t pt-4 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
                <Link href="/checkout" className="block">
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                  </Button>
                </Link>
                <Link href="/products" className="block">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
