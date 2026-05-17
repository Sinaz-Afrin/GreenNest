'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Calendar } from '@/components/ui/calendar';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Clock, MapPin } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const timeSlots = [
  { id: 'morning', label: 'Morning', time: '9:00 AM' },
  { id: 'afternoon', label: 'Afternoon', time: '1:00 PM' },
  { id: 'evening', label: 'Evening', time: '5:00 PM' },
];

export default function BookServicePage({ params }: { params: Promise<{ vendorId: string }> }) {
  const { vendorId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [isBooking, setIsBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [address, setAddress] = useState(user?.address || '');
  const [notes, setNotes] = useState('');

  const { data, isLoading, error } = useSWR(`/api/vendors/${vendorId}`, fetcher);
  const vendor = data?.vendor;

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTimeSlot || !selectedService || !address.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsBooking(true);
    const result = await api.createBooking({
      vendorId,
      serviceType: selectedService,
      date: selectedDate.toISOString(),
      timeSlot: selectedTimeSlot,
      address,
      notes,
    });
    setIsBooking(false);

    if (result.success) {
      toast.success('Booking created successfully!');
      router.push('/bookings');
    } else {
      toast.error(result.error || 'Failed to create booking');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Vendor not found</p>
        <Button variant="link" onClick={() => router.push('/services')}>
          Back to Services
        </Button>
      </div>
    );
  }

  const estimatedAmount = vendor.hourlyPrice * 2;

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Book a Service</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Booking Form */}
        <div className="md:col-span-2 space-y-6">
          {/* Service Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Service</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a service" />
                </SelectTrigger>
                <SelectContent>
                  {vendor.services.map((service: string) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date.getDay() === 0}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Time Slot Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Time Slot</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                <div className="grid grid-cols-3 gap-4">
                  {timeSlots.map((slot) => (
                    <label
                      key={slot.id}
                      className={`flex flex-col items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedTimeSlot === slot.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value={slot.id} className="sr-only" />
                      <Clock className="h-5 w-5 mb-2 text-primary" />
                      <span className="font-medium">{slot.label}</span>
                      <span className="text-sm text-muted-foreground">{slot.time}</span>
                    </label>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle>Service Location</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="address">Address</FieldLabel>
                  <Textarea
                    id="address"
                    placeholder="Enter the service location address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="notes">Additional Notes (Optional)</FieldLabel>
                  <Textarea
                    id="notes"
                    placeholder="Any special instructions or requirements"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>

        {/* Vendor Info & Summary */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="aspect-video relative rounded-lg overflow-hidden bg-muted mb-4">
                <Image
                  src={vendor.imageUrl || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop'}
                  alt={vendor.businessName}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-semibold">{vendor.businessName}</h3>
              <p className="text-sm text-muted-foreground">{vendor.userId?.name}</p>
              <div className="flex items-center gap-1 mt-2">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span className="font-medium">{vendor.rating?.toFixed(1)}</span>
                <span className="text-muted-foreground text-sm">({vendor.totalReviews} reviews)</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {vendor.services.map((service: string) => (
                  <Badge key={service} variant="secondary" className="text-xs">
                    {service}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Rate</span>
                <span>${vendor.hourlyPrice}/hour</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Duration</span>
                <span>2 hours</span>
              </div>
              <div className="border-t pt-4 flex justify-between font-semibold">
                <span>Estimated Total</span>
                <span className="text-primary">${estimatedAmount.toFixed(2)}</span>
              </div>
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleSubmit}
                disabled={isBooking || !selectedDate || !selectedTimeSlot || !selectedService || !address.trim()}
              >
                {isBooking ? <Spinner className="h-5 w-5" /> : 'Confirm Booking'}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Final amount may vary based on actual service duration
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
