"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher, api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  Check,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  _id: string;
  customerId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  serviceType: string;
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  notes?: string;
  status: string;
  totalPrice: number;
  createdAt: string;
}

export default function VendorBookingsPage() {
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data: bookings, isLoading } = useSWR<Booking[]>(
    "/api/bookings?role=vendor",
    fetcher
  );

  const handleStatusUpdate = async (bookingId: string, status: string) => {
    setUpdatingId(bookingId);
    try {
      await api.patch(`/api/bookings/${bookingId}/status`, { status });
      toast({
        title: "Success",
        description: `Booking ${status}`,
      });
      mutate("/api/bookings?role=vendor");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

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

  const filterBookings = (status: string) => {
    if (!bookings) return [];
    if (status === "all") return bookings;
    return bookings.filter((b) => b.status === status);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const pendingCount = bookings?.filter((b) => b.status === "pending").length || 0;
  const confirmedCount = bookings?.filter((b) => b.status === "confirmed").length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Bookings</h1>
        <p className="text-muted-foreground">
          Manage your service bookings
        </p>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingCount > 0 && (
              <span className="ml-2 rounded-full bg-yellow-500 px-2 py-0.5 text-xs text-white">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            Confirmed
            {confirmedCount > 0 && (
              <span className="ml-2 rounded-full bg-green-500 px-2 py-0.5 text-xs text-white">
                {confirmedCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        {["pending", "confirmed", "completed", "all"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            {filterBookings(tab).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No {tab} bookings</h3>
                  <p className="text-muted-foreground">
                    {tab === "pending"
                      ? "New booking requests will appear here"
                      : tab === "confirmed"
                      ? "Confirmed appointments will show here"
                      : "Completed bookings will be listed here"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filterBookings(tab).map((booking) => (
                  <Card key={booking._id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {booking.serviceType}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Booking #{booking._id.slice(-6).toUpperCase()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.customerId?.name || "Customer"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.customerId?.phone || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(booking.scheduledDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.scheduledTime}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{booking.address}</span>
                      </div>
                      {booking.notes && (
                        <div className="rounded-lg bg-muted p-3 text-sm">
                          <span className="font-medium">Notes:</span>{" "}
                          {booking.notes}
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-lg font-bold text-primary">
                          ₹{booking.totalPrice}
                        </span>
                        {booking.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() =>
                                handleStatusUpdate(booking._id, "cancelled")
                              }
                              disabled={updatingId === booking._id}
                            >
                              {updatingId === booking._id ? (
                                <Spinner className="h-4 w-4" />
                              ) : (
                                <>
                                  <X className="mr-1 h-3 w-3" />
                                  Decline
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleStatusUpdate(booking._id, "confirmed")
                              }
                              disabled={updatingId === booking._id}
                            >
                              {updatingId === booking._id ? (
                                <Spinner className="h-4 w-4" />
                              ) : (
                                <>
                                  <Check className="mr-1 h-3 w-3" />
                                  Confirm
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                        {booking.status === "confirmed" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleStatusUpdate(booking._id, "completed")
                            }
                            disabled={updatingId === booking._id}
                          >
                            {updatingId === booking._id ? (
                              <Spinner className="h-4 w-4" />
                            ) : (
                              "Mark Complete"
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
