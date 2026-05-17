"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Users,
  Store,
  Package,
  ShoppingCart,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Link from "next/link";

interface ReportData {
  totalUsers: number;
  totalVendors: number;
  pendingVendors: number;
  totalProducts: number;
  totalOrders: number;
  totalBookings: number;
  revenue: {
    total: number;
    orders: number;
    bookings: number;
  };
  recentActivity: {
    type: string;
    message: string;
    createdAt: string;
  }[];
}

export default function AdminDashboardPage() {
  const { data: report, isLoading } = useSWR<ReportData>(
    "/api/admin/reports",
    fetcher
  );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const stats = [
    {
      title: "Total Users",
      value: report?.totalUsers || 0,
      icon: Users,
      change: "+12%",
      changeType: "positive",
      href: "/admin/users",
    },
    {
      title: "Total Vendors",
      value: report?.totalVendors || 0,
      icon: Store,
      change: report?.pendingVendors ? `${report.pendingVendors} pending` : "0 pending",
      changeType: report?.pendingVendors ? "warning" : "neutral",
      href: "/admin/vendors",
    },
    {
      title: "Total Products",
      value: report?.totalProducts || 0,
      icon: Package,
      change: "+8%",
      changeType: "positive",
      href: "/admin/products",
    },
    {
      title: "Total Orders",
      value: report?.totalOrders || 0,
      icon: ShoppingCart,
      change: "+15%",
      changeType: "positive",
      href: "/admin/orders",
    },
    {
      title: "Total Bookings",
      value: report?.totalBookings || 0,
      icon: Calendar,
      change: "+5%",
      changeType: "positive",
      href: "/admin/bookings",
    },
    {
      title: "Total Revenue",
      value: `₹${(report?.revenue?.total || 0).toLocaleString()}`,
      icon: TrendingUp,
      change: "+22%",
      changeType: "positive",
      href: "/admin/reports",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your GreenNest platform
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p
                  className={`text-xs flex items-center gap-1 ${
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : stat.changeType === "warning"
                      ? "text-yellow-600"
                      : "text-muted-foreground"
                  }`}
                >
                  {stat.changeType === "positive" ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : stat.changeType === "negative" ? (
                    <ArrowDownRight className="h-3 w-3" />
                  ) : null}
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span className="text-sm">Product Sales</span>
              </div>
              <span className="font-medium">
                ₹{(report?.revenue?.orders || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-accent" />
                <span className="text-sm">Service Bookings</span>
              </div>
              <span className="font-medium">
                ₹{(report?.revenue?.bookings || 0).toLocaleString()}
              </span>
            </div>
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Revenue</span>
                <span className="text-lg font-bold text-primary">
                  ₹{(report?.revenue?.total || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Link href="/admin/vendors">
              <Button variant="outline" className="w-full justify-start">
                <Store className="mr-2 h-4 w-4" />
                Manage Vendors
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/products">
              <Button variant="outline" className="w-full justify-start">
                <Package className="mr-2 h-4 w-4" />
                All Products
              </Button>
            </Link>
            <Link href="/admin/categories">
              <Button variant="outline" className="w-full justify-start">
                <Package className="mr-2 h-4 w-4" />
                Categories
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button variant="outline" className="w-full justify-start">
                <ShoppingCart className="mr-2 h-4 w-4" />
                All Orders
              </Button>
            </Link>
            <Link href="/admin/bookings">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                All Bookings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {!report?.recentActivity || report.recentActivity.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No recent activity
            </p>
          ) : (
            <div className="space-y-4">
              {report.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{activity.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.message}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
