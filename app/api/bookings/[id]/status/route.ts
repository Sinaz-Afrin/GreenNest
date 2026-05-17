import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Booking, VendorProfile } from '@/lib/models';
import { getCurrentUser, unauthorizedResponse, forbiddenResponse, notFoundResponse, badRequestResponse, serverErrorResponse } from '@/lib/auth';
import { mockBookings, mockVendorProfiles } from '@/lib/mock-data';

const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return unauthorizedResponse();
    }

    if (currentUser.role !== 'vendor' && currentUser.role !== 'admin') {
      return forbiddenResponse('Only vendors and admins can update booking status');
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !validStatuses.includes(status)) {
      return badRequestResponse(`Invalid status. Valid statuses are: ${validStatuses.join(', ')}`);
    }

    const db = await connectToDatabase();

    if (db) {
      const booking = await Booking.findById(id);

      if (!booking) {
        return notFoundResponse('Booking not found');
      }

      // Vendors can only update their own bookings
      if (currentUser.role === 'vendor' && booking.vendor.toString() !== currentUser.userId) {
        return forbiddenResponse('You can only update your own bookings');
      }

      booking.status = status;
      await booking.save();

      // If completed, add to vendor earnings
      if (status === 'completed') {
        const vendorProfile = await VendorProfile.findOne({ userId: booking.vendor });
        if (vendorProfile) {
          vendorProfile.earnings += booking.amount;
          await vendorProfile.save();
        }
      }

      return Response.json({ success: true, booking });
    } else {
      const bookingIndex = mockBookings.findIndex(b => b._id === id);

      if (bookingIndex === -1) {
        return notFoundResponse('Booking not found');
      }

      const booking = mockBookings[bookingIndex];

      // Vendors can only update their own bookings
      if (currentUser.role === 'vendor' && booking.vendor !== currentUser.userId) {
        return forbiddenResponse('You can only update your own bookings');
      }

      mockBookings[bookingIndex].status = status as typeof booking.status;
      mockBookings[bookingIndex].updatedAt = new Date();

      // If completed, add to vendor earnings
      if (status === 'completed') {
        const vendorIndex = mockVendorProfiles.findIndex(vp => vp.userId === booking.vendor);
        if (vendorIndex !== -1) {
          mockVendorProfiles[vendorIndex].earnings += booking.amount;
        }
      }

      return Response.json({ success: true, booking: mockBookings[bookingIndex] });
    }
  } catch (error) {
    console.error('Update booking status error:', error);
    return serverErrorResponse('Failed to update booking status');
  }
}
