"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher, api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Package, ChevronDown, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OrderItem {
  productId: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  customerId: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
];

export default function VendorOrdersPage() {
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("all");

  const { data: orders, isLoading } = useSWR<Order[]>("/api/orders", fetcher);

  const toggleExpanded = (orderId: string) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/api/orders/${orderId}/status`, { status: newStatus });
      toast({
        title: "Success",
        description: `Order status updated to ${newStatus}`,
      });
      mutate("/api/orders");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
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
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filterOrders = (status: string) => {
    if (!orders) return [];
    if (status === "all") return orders;
    return orders.filter((o) => o.status === status);
  };

  const formatOrderId = (id: string) => {
    return `#${id.slice(-6).toUpperCase()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const statusCounts = {
    all: orders?.length || 0,
    pending: orders?.filter((o) => o.status === "pending").length || 0,
    processing: orders?.filter((o) => o.status === "processing").length || 0,
    shipped: orders?.filter((o) => o.status === "shipped").length || 0,
    delivered: orders?.filter((o) => o.status === "delivered").length || 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground">
          Manage and fulfill customer orders
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All ({statusCounts.all})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({statusCounts.pending})
          </TabsTrigger>
          <TabsTrigger value="processing">
            Processing ({statusCounts.processing})
          </TabsTrigger>
          <TabsTrigger value="shipped">
            Shipped ({statusCounts.shipped})
          </TabsTrigger>
          <TabsTrigger value="delivered">
            Delivered ({statusCounts.delivered})
          </TabsTrigger>
        </TabsList>

        {["all", "pending", "processing", "shipped", "delivered"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            {filterOrders(tab).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No orders received yet</h3>
                  <p className="text-muted-foreground">
                    {tab === "all"
                      ? "Orders will appear here once customers make purchases"
                      : `No ${tab} orders at the moment`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10"></TableHead>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterOrders(tab).map((order) => (
                        <Collapsible
                          key={order._id}
                          open={expandedOrders.has(order._id)}
                          onOpenChange={() => toggleExpanded(order._id)}
                          asChild
                        >
                          <>
                            <TableRow className="cursor-pointer hover:bg-muted/50">
                              <TableCell>
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    {expandedOrders.has(order._id) ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                  </Button>
                                </CollapsibleTrigger>
                              </TableCell>
                              <TableCell className="font-medium">
                                {formatOrderId(order._id)}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">
                                    {order.customerId?.name || "Customer"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {order.customerId?.email}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                {order.items?.length || 0} item(s)
                              </TableCell>
                              <TableCell className="font-semibold">
                                ₹{order.totalAmount?.toLocaleString()}
                              </TableCell>
                              <TableCell>{formatDate(order.createdAt)}</TableCell>
                              <TableCell>
                                {updatingId === order._id ? (
                                  <Spinner className="h-4 w-4" />
                                ) : (
                                  <Select
                                    value={order.status}
                                    onValueChange={(value) =>
                                      handleStatusChange(order._id, value)
                                    }
                                  >
                                    <SelectTrigger className="w-32 h-8">
                                      <SelectValue>
                                        <Badge className={getStatusColor(order.status)}>
                                          {order.status}
                                        </Badge>
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                      {STATUS_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                          {opt.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              </TableCell>
                            </TableRow>
                            <CollapsibleContent asChild>
                              <TableRow className="bg-muted/30">
                                <TableCell colSpan={7} className="p-4">
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-semibold mb-2">Order Items</h4>
                                      <div className="space-y-2">
                                        {order.items?.map((item, idx) => (
                                          <div
                                            key={idx}
                                            className="flex items-center justify-between bg-background rounded-lg p-3"
                                          >
                                            <div>
                                              <p className="font-medium">
                                                {item.productId?.name || "Product"}
                                              </p>
                                              <p className="text-sm text-muted-foreground">
                                                Qty: {item.quantity} x ₹{item.price}
                                              </p>
                                            </div>
                                            <p className="font-semibold">
                                              ₹{(item.quantity * item.price).toLocaleString()}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    {order.shippingAddress && (
                                      <div>
                                        <h4 className="font-semibold mb-1">Shipping Address</h4>
                                        <p className="text-sm text-muted-foreground">
                                          {order.shippingAddress.street},{" "}
                                          {order.shippingAddress.city},{" "}
                                          {order.shippingAddress.state} -{" "}
                                          {order.shippingAddress.pincode}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            </CollapsibleContent>
                          </>
                        </Collapsible>
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
