'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar } from 'lucide-react';

interface VendorCardProps {
  vendor: {
    _id: string;
    userId: {
      _id: string;
      name: string;
    };
    businessName: string;
    services: string[];
    hourlyPrice: number;
    rating: number;
    totalReviews: number;
    bio?: string;
    imageUrl?: string;
  };
}

export function VendorCard({ vendor }: VendorCardProps) {
  return (
    <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
      <div className="aspect-video relative overflow-hidden bg-muted">
        <Image
          src={vendor.imageUrl || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop'}
          alt={vendor.businessName}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-foreground">{vendor.businessName}</h3>
            <p className="text-sm text-muted-foreground">{vendor.userId?.name}</p>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="font-medium">{vendor.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">({vendor.totalReviews})</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
          {vendor.bio || 'Professional gardening services tailored to your needs.'}
        </p>

        <div className="flex flex-wrap gap-1 mt-3">
          {vendor.services.slice(0, 3).map((service) => (
            <Badge key={service} variant="secondary" className="text-xs">
              {service}
            </Badge>
          ))}
          {vendor.services.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{vendor.services.length - 3} more
            </Badge>
          )}
        </div>

        <div className="mt-3 text-lg font-bold text-primary">
          ${vendor.hourlyPrice}/hour
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/book/${vendor.userId?._id}`} className="w-full">
          <Button className="w-full">
            <Calendar className="h-4 w-4 mr-2" />
            Book Now
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
