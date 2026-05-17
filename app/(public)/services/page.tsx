'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { VendorCard } from '@/components/services/vendor-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const serviceTypes = [
  { id: 'all', name: 'All Services' },
  { id: 'Home Gardening', name: 'Home Gardening' },
  { id: 'Lawn Maintenance', name: 'Lawn Maintenance' },
  { id: 'Plant Care', name: 'Plant Care' },
  { id: 'Pot Arrangement', name: 'Pot Arrangement' },
];

function ServicesContent() {
  const searchParams = useSearchParams();
  const initialService = searchParams.get('service') || 'all';
  const [selectedService, setSelectedService] = useState(initialService);

  const queryParam = selectedService !== 'all' ? `?service=${encodeURIComponent(selectedService)}` : '';
  const { data, isLoading } = useSWR(`/api/vendors${queryParam}`, fetcher);

  const vendors = data?.vendors || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Gardening Services</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Connect with professional gardeners for all your home and garden needs
        </p>
      </div>

      {/* Service Filter Tabs */}
      <div className="flex justify-center mb-8 overflow-x-auto">
        <Tabs value={selectedService} onValueChange={setSelectedService}>
          <TabsList className="flex-wrap h-auto gap-1">
            {serviceTypes.map((service) => (
              <TabsTrigger key={service.id} value={service.id} className="text-sm">
                {service.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Vendors Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : vendors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor: {
            _id: string;
            userId: { _id: string; name: string };
            businessName: string;
            services: string[];
            hourlyPrice: number;
            rating: number;
            totalReviews: number;
            bio?: string;
            imageUrl?: string;
          }) => (
            <VendorCard key={vendor._id} vendor={vendor} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No vendors found for this service</p>
          {selectedService !== 'all' && (
            <Button variant="link" onClick={() => setSelectedService('all')} className="mt-2">
              View all services
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      </div>
    }>
      <ServicesContent />
    </Suspense>
  );
}
