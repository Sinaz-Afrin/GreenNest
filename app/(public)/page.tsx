'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProductCard } from '@/components/products/product-card';
import { Leaf, Truck, ThumbsUp, HeartHandshake, ArrowRight, Star } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const services = [
  {
    title: 'Home Gardening',
    description: 'Transform your space into a lush garden oasis with our expert home gardening services.',
    icon: '🏡',
  },
  {
    title: 'Lawn Maintenance',
    description: 'Keep your lawn healthy and beautiful with professional maintenance services.',
    icon: '🌿',
  },
  {
    title: 'Plant Care',
    description: 'Expert care and advice for all your indoor and outdoor plants.',
    icon: '🪴',
  },
  {
    title: 'Pot Arrangement',
    description: 'Creative pot arrangements to enhance your interior and exterior spaces.',
    icon: '🏺',
  },
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Homeowner',
    content: 'GreenNest transformed my backyard into a beautiful garden. The quality of plants and professional service exceeded my expectations!',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Interior Designer',
    content: 'I always recommend GreenNest to my clients. Their plant selection is amazing and the delivery is always on time.',
    rating: 5,
  },
  {
    name: 'Emily Williams',
    role: 'Plant Enthusiast',
    content: 'The gardening services are top-notch. My indoor plants have never looked better since I started using their plant care service.',
    rating: 5,
  },
];

export default function HomePage() {
  const { data: productsData } = useSWR('/api/products?sort=newest', fetcher);
  const featuredProducts = productsData?.products?.slice(0, 4) || [];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/10 to-background py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                Fresh Plants, Expert Care{' '}
                <span className="text-primary">Delivered to Your Door</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                Discover a wide variety of plants, seeds, and gardening supplies. Book professional gardening services for your home or office.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/products">
                  <Button size="lg" className="gap-2">
                    Shop Plants
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/services">
                  <Button size="lg" variant="outline">
                    Book Services
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src="/hero-plants.jpg"
                alt="Lush garden plants"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center p-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">Quality Plants</h3>
              <p className="text-xs text-muted-foreground mt-1">Healthy & vibrant</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">Fast Delivery</h3>
              <p className="text-xs text-muted-foreground mt-1">Right to your door</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <ThumbsUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">Expert Advice</h3>
              <p className="text-xs text-muted-foreground mt-1">Care tips included</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <HeartHandshake className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">Satisfaction</h3>
              <p className="text-xs text-muted-foreground mt-1">Guaranteed quality</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Featured Products</h2>
              <p className="text-muted-foreground mt-1">Discover our most popular plants and supplies</p>
            </div>
            <Link href="/products">
              <Button variant="outline" className="hidden md:flex gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product: {
              _id: string;
              name: string;
              price: number;
              imageUrl: string;
              stock: number;
              rating?: number;
              category?: { name: string; slug: string };
              vendorName?: string;
            }) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link href="/products">
              <Button variant="outline" className="gap-2">
                View All Products
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">Our Services</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Professional gardening services to help you create and maintain beautiful green spaces
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <Card key={service.title} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="font-semibold mb-2">{service.title}</h3>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/services">
              <Button size="lg" className="gap-2">
                Browse Services
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">What Our Customers Say</h2>
            <p className="text-muted-foreground mt-2">Trusted by plant lovers everywhere</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-muted-foreground flex-1">{`"${testimonial.content}"`}</p>
                  <div className="mt-4 pt-4 border-t">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Your Garden Journey?</h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Join thousands of happy customers who have transformed their spaces with GreenNest
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/products">
              <Button size="lg" variant="secondary">
                Shop Now
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
