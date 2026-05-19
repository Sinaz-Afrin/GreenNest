"use client";

import { useAuth } from "@/lib/auth-context";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Package, Calendar, DollarSign, Star, Plus } from "lucide-react";
import Link from "next/link";

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  status: string;
  images: string[];
}

interface Booking {
  _id: string;
  customerId: { name: string };
  serviceType: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  totalPrice: number;
}

export default function VendorDashboardPage() {
  const { user } = useAuth();
  const { data: products, isLoading: productsLoading } = useSWR<Product[]>(
    "/api/products?vendorId=me",
    fetcher
  );
  const { data: bookings, isLoading: bookingsLoading } = useSWR<Booking[]>(
    "/api/bookings?role=vendor",
    fetcher
  );

  const isLoading = productsLoading || bookingsLoading;

  const totalProducts = products?.length || 0;
  const activeProducts = products?.filter((p) => p.status === "active").length || 0;
  const pendingBookings = bookings?.filter((b) => b.status === "pending").length || 0;
  const totalEarnings = bookings
    ?.filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + b.totalPrice, 0) || 0;

  const recentBookings = bookings?.slice(0, 5) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-teal-100 text-teal-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vendor Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Manage your products and services.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {activeProducts} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBookings}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting confirmation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From completed services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-xs text-muted-foreground">
              Based on customer reviews
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No bookings yet
              </p>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{booking.customerId?.name || "Customer"}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.serviceType} - {new Date(booking.scheduledDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <Link href="/vendor/bookings">
              <Button variant="outline" className="mt-4 w-full">
                View All Bookings
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/vendor/products" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Package className="mr-2 h-4 w-4" />
                Manage Products
              </Button>
            </Link>
            <Link href="/vendor/services" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Manage Services
              </Button>
            </Link>
            <Link href="/vendor/bookings" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                View Bookings
              </Button>
            </Link>
            <Link href="/vendor/profile" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Star className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
