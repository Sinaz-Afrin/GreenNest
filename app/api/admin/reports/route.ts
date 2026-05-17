import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Order, Booking, User, VendorProfile } from '@/lib/models';
import { getCurrentUser, unauthorizedResponse, forbiddenResponse, serverErrorResponse } from '@/lib/auth';
import { mockOrders, mockBookings, mockUsers, mockVendorProfiles } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return unauthorizedResponse();
    }

    if (currentUser.role !== 'admin') {
      return forbiddenResponse('Only admins can access reports');
    }

    const db = await connectToDatabase();

    if (db) {
      // Get totals
      const totalUsers = await User.countDocuments();
      const totalVendors = await VendorProfile.countDocuments({ isApproved: true });
      const totalOrders = await Order.countDocuments();
      const totalBookings = await Booking.countDocuments();

      // Calculate revenue
      const orders = await Order.find({ paymentStatus: 'paid' });
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

      const bookings = await Booking.find({ status: 'completed' });
      const bookingsRevenue = bookings.reduce((sum, booking) => sum + booking.amount, 0);

      // Monthly revenue (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const monthlyOrders = await Order.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo }, paymentStatus: 'paid' } },
        {
          $group: {
            _id: { $month: '$createdAt' },
            revenue: { $sum: '$totalAmount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Top vendors
      const topVendors = await VendorProfile.find({ isApproved: true })
        .populate('userId', 'name')
        .sort({ earnings: -1 })
        .limit(5);

      return Response.json({
        success: true,
        stats: {
          totalUsers,
          totalVendors,
          totalOrders,
          totalBookings,
          totalRevenue: totalRevenue + bookingsRevenue,
        },
        monthlyRevenue: monthlyOrders,
        topVendors: topVendors.map(v => ({
          businessName: v.businessName,
          ownerName: v.userId?.name || 'Unknown',
          earnings: v.earnings,
          rating: v.rating,
        })),
      });
    } else {
      // Mock data calculations
      const totalUsers = mockUsers.length;
      const totalVendors = mockVendorProfiles.filter(vp => vp.isApproved).length;
      const totalOrders = mockOrders.length;
      const totalBookings = mockBookings.length;

      const totalOrderRevenue = mockOrders
        .filter(o => o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + o.totalAmount, 0);

      const totalBookingRevenue = mockBookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + b.amount, 0);

      const totalRevenue = totalOrderRevenue + totalBookingRevenue;

      // Generate mock monthly data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const monthlyRevenue = months.map((month, index) => ({
        month,
        _id: index + 1,
        revenue: Math.floor(Math.random() * 5000) + 1000,
        count: Math.floor(Math.random() * 50) + 10,
      }));

      // Top vendors
      const topVendors = mockVendorProfiles
        .filter(vp => vp.isApproved)
        .sort((a, b) => b.earnings - a.earnings)
        .slice(0, 5)
        .map(vp => {
          const user = mockUsers.find(u => u._id === vp.userId);
          return {
            businessName: vp.businessName,
            ownerName: user?.name || 'Unknown',
            earnings: vp.earnings,
            rating: vp.rating,
          };
        });

      return Response.json({
        success: true,
        stats: {
          totalUsers,
          totalVendors,
          totalOrders,
          totalBookings,
          totalRevenue,
        },
        monthlyRevenue,
        topVendors,
      });
    }
  } catch (error) {
    console.error('Get reports error:', error);
    return serverErrorResponse('Failed to get reports');
  }
}
