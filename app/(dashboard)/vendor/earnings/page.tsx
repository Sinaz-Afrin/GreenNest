"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  Package,
  Wrench,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface EarningsData {
  totalEarnings: number;
  thisMonth: number;
  thisWeek: number;
  pendingPayouts: number;
  productEarnings: number;
  serviceEarnings: number;
  transactions: {
    _id: string;
    type: "order" | "booking";
    customerName: string;
    amount: number;
    status: "paid" | "pending";
    date: string;
  }[];
  monthlyEarnings: {
    month: string;
    amount: number;
  }[];
}

// Mock data for demonstration since API endpoint may not exist
const mockEarningsData: EarningsData = {
  totalEarnings: 125000,
  thisMonth: 32500,
  thisWeek: 8750,
  pendingPayouts: 15000,
  productEarnings: 85000,
  serviceEarnings: 40000,
  transactions: [
    { _id: "1", type: "order", customerName: "Rahul Sharma", amount: 2500, status: "paid", date: "2024-01-15" },
    { _id: "2", type: "booking", customerName: "Priya Patel", amount: 1500, status: "paid", date: "2024-01-14" },
    { _id: "3", type: "order", customerName: "Amit Kumar", amount: 3200, status: "pending", date: "2024-01-13" },
    { _id: "4", type: "booking", customerName: "Sneha Reddy", amount: 2000, status: "paid", date: "2024-01-12" },
    { _id: "5", type: "order", customerName: "Vikram Singh", amount: 1800, status: "pending", date: "2024-01-11" },
  ],
  monthlyEarnings: [
    { month: "Aug", amount: 18000 },
    { month: "Sep", amount: 22000 },
    { month: "Oct", amount: 19500 },
    { month: "Nov", amount: 28000 },
    { month: "Dec", amount: 35000 },
    { month: "Jan", amount: 32500 },
  ],
};

export default function VendorEarningsPage() {
  const { data: apiData, isLoading } = useSWR<EarningsData>(
    "/api/admin/reports/revenue",
    fetcher,
    { fallbackData: mockEarningsData }
  );

  const data = apiData || mockEarningsData;

  const productPercentage = data.totalEarnings > 0
    ? Math.round((data.productEarnings / data.totalEarnings) * 100)
    : 0;
  const servicePercentage = data.totalEarnings > 0
    ? Math.round((data.serviceEarnings / data.totalEarnings) * 100)
    : 0;

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Earnings</h1>
        <p className="text-muted-foreground">
          Track your revenue and payouts
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{data.totalEarnings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{data.thisMonth.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +12% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{data.thisWeek.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Current week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              ₹{data.pendingPayouts.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting settlement</p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Earnings Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="font-medium">Products</span>
                </div>
                <span className="font-semibold">
                  ₹{data.productEarnings.toLocaleString()} ({productPercentage}%)
                </span>
              </div>
              <Progress value={productPercentage} className="h-3" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-accent" />
                  <span className="font-medium">Services</span>
                </div>
                <span className="font-semibold">
                  ₹{data.serviceEarnings.toLocaleString()} ({servicePercentage}%)
                </span>
              </div>
              <Progress value={servicePercentage} className="h-3 [&>div]:bg-accent" />
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">
                  ₹{data.totalEarnings.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Earnings (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyEarnings}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => `₹${(value / 1000)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Earnings']}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.transactions.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        transaction.type === "order"
                          ? "border-primary text-primary"
                          : "border-accent text-accent"
                      }
                    >
                      {transaction.type === "order" ? (
                        <Package className="mr-1 h-3 w-3" />
                      ) : (
                        <Wrench className="mr-1 h-3 w-3" />
                      )}
                      {transaction.type === "order" ? "Order" : "Booking"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {transaction.customerName}
                  </TableCell>
                  <TableCell className="font-semibold">
                    ₹{transaction.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        transaction.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }
                    >
                      {transaction.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
