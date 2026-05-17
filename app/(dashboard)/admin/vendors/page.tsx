"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher, api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Check, X, Store } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Vendor {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  businessName: string;
  phone: string;
  status: string;
  serviceAreas: string[];
  createdAt: string;
}

export default function AdminVendorsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data: vendors, isLoading } = useSWR<Vendor[]>(
    "/api/admin/vendors",
    fetcher
  );

  const handleStatusUpdate = async (vendorId: string, status: string) => {
    setUpdatingId(vendorId);
    try {
      await api.patch(`/api/admin/vendors/${vendorId}/status`, { status });
      toast({
        title: "Success",
        description: `Vendor ${status}`,
      });
      mutate("/api/admin/vendors");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update vendor status",
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
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "suspended":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filterVendors = (status: string) => {
    if (!vendors) return [];
    let filtered = vendors;
    if (status !== "all") {
      filtered = vendors.filter((v) => v.status === status);
    }
    if (search) {
      filtered = filtered.filter(
        (v) =>
          v.businessName.toLowerCase().includes(search.toLowerCase()) ||
          v.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
          v.userId?.email?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return filtered;
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const pendingCount = vendors?.filter((v) => v.status === "pending").length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vendor Management</h1>
          <p className="text-muted-foreground">
            Approve and manage vendor accounts
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
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
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        {["pending", "approved", "rejected", "all"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            {filterVendors(tab).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Store className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No vendors found</h3>
                  <p className="text-muted-foreground">
                    {search
                      ? "Try a different search term"
                      : `No ${tab === "all" ? "" : tab} vendors`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Business Name</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Service Areas</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterVendors(tab).map((vendor) => (
                        <TableRow key={vendor._id}>
                          <TableCell className="font-medium">
                            {vendor.businessName}
                          </TableCell>
                          <TableCell>{vendor.userId?.name || "N/A"}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {vendor.userId?.email}
                              {vendor.phone && (
                                <div className="text-muted-foreground">
                                  {vendor.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {vendor.serviceAreas?.slice(0, 2).map((area) => (
                                <Badge key={area} variant="outline" className="text-xs">
                                  {area}
                                </Badge>
                              ))}
                              {vendor.serviceAreas?.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{vendor.serviceAreas.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(vendor.status)}>
                              {vendor.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(vendor.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {vendor.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                    onClick={() =>
                                      handleStatusUpdate(vendor._id, "rejected")
                                    }
                                    disabled={updatingId === vendor._id}
                                  >
                                    {updatingId === vendor._id ? (
                                      <Spinner className="h-4 w-4" />
                                    ) : (
                                      <X className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleStatusUpdate(vendor._id, "approved")
                                    }
                                    disabled={updatingId === vendor._id}
                                  >
                                    {updatingId === vendor._id ? (
                                      <Spinner className="h-4 w-4" />
                                    ) : (
                                      <Check className="h-4 w-4" />
                                    )}
                                  </Button>
                                </>
                              )}
                              {vendor.status === "approved" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleStatusUpdate(vendor._id, "suspended")
                                  }
                                  disabled={updatingId === vendor._id}
                                >
                                  Suspend
                                </Button>
                              )}
                              {(vendor.status === "rejected" ||
                                vendor.status === "suspended") && (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleStatusUpdate(vendor._id, "approved")
                                  }
                                  disabled={updatingId === vendor._id}
                                >
                                  Approve
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
