import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Booking, VendorProfile } from '@/lib/models';
import { getCurrentUser, unauthorizedResponse, forbiddenResponse, badRequestResponse, notFoundResponse, serverErrorResponse } from '@/lib/auth';
import { mockBookings, mockUsers, mockVendorProfiles } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return unauthorizedResponse();
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    const db = await connectToDatabase();

    if (db) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query: any = {};

      if (currentUser.role === 'customer') {
        query.customer = currentUser.userId;
      } else if (currentUser.role === 'vendor') {
        query.vendor = currentUser.userId;
      }
      // Admin gets all bookings

      if (status) {
        query.status = status;
      }

      const bookings = await Booking.find(query)
        .populate('customer', 'name email')
        .populate('vendor', 'name email')
        .sort({ date: -1 });

      // Get vendor profiles for business names
      const vendorIds = [...new Set(bookings.map(b => b.vendor?._id?.toString()).filter(Boolean))];
      const vendorProfiles = await VendorProfile.find({ userId: { $in: vendorIds } });

      const bookingsWithDetails = bookings.map(booking => {
        const vp = vendorProfiles.find(v => v.userId.toString() === booking.vendor?._id?.toString());
        return {
          ...booking.toObject(),
          vendorProfile: vp ? { businessName: vp.businessName } : null,
        };
      });

      return Response.json({ success: true, bookings: bookingsWithDetails });
    } else {
      let filteredBookings = [...mockBookings];

      if (currentUser.role === 'customer') {
        filteredBookings = filteredBookings.filter(b => b.customer === currentUser.userId);
      } else if (currentUser.role === 'vendor') {
        filteredBookings = filteredBookings.filter(b => b.vendor === currentUser.userId);
      }

      if (status) {
        filteredBookings = filteredBookings.filter(b => b.status === status);
      }

      // Sort by date
      filteredBookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Add user and vendor details
      const bookingsWithDetails = filteredBookings.map(booking => {
        const customer = mockUsers.find(u => u._id === booking.customer);
        const vendor = mockUsers.find(u => u._id === booking.vendor);
        const vendorProfile = mockVendorProfiles.find(vp => vp.userId === booking.vendor);
        return {
          ...booking,
          customer: customer ? { _id: customer._id, name: customer.name, email: customer.email } : null,
          vendor: vendor ? { _id: vendor._id, name: vendor.name, email: vendor.email } : null,
          vendorProfile: vendorProfile ? { businessName: vendorProfile.businessName } : null,
        };
      });

      return Response.json({ success: true, bookings: bookingsWithDetails });
    }
  } catch (error) {
    console.error('Get bookings error:', error);
    return serverErrorResponse('Failed to get bookings');
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return unauthorizedResponse();
    }

    if (currentUser.role !== 'customer') {
      return forbiddenResponse('Only customers can create bookings');
    }

    const body = await request.json();
    const { vendorId, serviceType, date, timeSlot, address, notes } = body;

    if (!vendorId || !serviceType || !date || !timeSlot || !address) {
      return badRequestResponse('Please provide all required fields');
    }

    const validTimeSlots = ['morning', 'afternoon', 'evening'];
    if (!validTimeSlots.includes(timeSlot)) {
      return badRequestResponse('Invalid time slot');
    }

    const db = await connectToDatabase();

    if (db) {
      const vendorProfile = await VendorProfile.findOne({ userId: vendorId });

      if (!vendorProfile) {
        return notFoundResponse('Vendor not found');
      }

      if (!vendorProfile.isApproved) {
        return badRequestResponse('Vendor is not available');
      }

      if (!vendorProfile.services.includes(serviceType)) {
        return badRequestResponse('Vendor does not offer this service');
      }

      const booking = await Booking.create({
        customer: currentUser.userId,
        vendor: vendorId,
        serviceType,
        date: new Date(date),
        timeSlot,
        address,
        status: 'pending',
        amount: vendorProfile.hourlyPrice * 2, // Assuming 2 hours minimum
        notes,
      });

      return Response.json({ success: true, booking }, { status: 201 });
    } else {
      const vendorProfile = mockVendorProfiles.find(vp => vp.userId === vendorId);

      if (!vendorProfile) {
        return notFoundResponse('Vendor not found');
      }

      if (!vendorProfile.isApproved) {
        return badRequestResponse('Vendor is not available');
      }

      if (!vendorProfile.services.includes(serviceType)) {
        return badRequestResponse('Vendor does not offer this service');
      }

      const newBooking = {
        _id: `booking${Date.now()}`,
        customer: currentUser.userId,
        vendor: vendorId,
        serviceType,
        date: new Date(date),
        timeSlot: timeSlot as 'morning' | 'afternoon' | 'evening',
        address,
        status: 'pending' as const,
        amount: vendorProfile.hourlyPrice * 2,
        notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBookings.push(newBooking);

      return Response.json({ success: true, booking: newBooking }, { status: 201 });
    }
  } catch (error) {
    console.error('Create booking error:', error);
    return serverErrorResponse('Failed to create booking');
  }
}
