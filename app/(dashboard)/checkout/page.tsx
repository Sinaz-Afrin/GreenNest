'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { useAuth } from '@/lib/auth-context';
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
  };
  quantity: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading } = useSWR('/api/cart', fetcher);
  const [isPlacing, setIsPlacing] = useState(false);
  const [address, setAddress] = useState(user?.address || '');
  const [notes, setNotes] = useState('');

  const cartItems: CartItem[] = data?.cart?.items || [];

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0);

  const deliveryFee = 5.99;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      toast.error('Please enter a delivery address');
      return;
    }

    setIsPlacing(true);
    const result = await api.createOrder({ deliveryAddress: address, notes });
    setIsPlacing(false);

    if (result.success) {
      toast.success('Order placed successfully!');
      router.push('/orders');
    } else {
      toast.error(result.error || 'Failed to place order');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    router.push('/cart');
    return null;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Delivery Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Address</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="address">Full Address</FieldLabel>
                  <Textarea
                    id="address"
                    placeholder="Enter your complete delivery address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="notes">Order Notes (Optional)</FieldLabel>
                  <Textarea
                    id="notes"
                    placeholder="Any special instructions for delivery"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.product?._id} className="flex items-center gap-4">
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
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
                    <p className="font-medium truncate">{item.product?.name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">
                    ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
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
              <Button 
                className="w-full" 
                size="lg"
                onClick={handlePlaceOrder}
                disabled={isPlacing || !address.trim()}
              >
                {isPlacing ? <Spinner className="h-5 w-5" /> : 'Place Order'}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                By placing this order, you agree to our terms of service
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
