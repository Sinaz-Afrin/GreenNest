import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { VendorProfile, User } from '@/lib/models';
import { serverErrorResponse } from '@/lib/auth';
import { mockVendorProfiles, mockUsers } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const service = searchParams.get('service');

    const db = await connectToDatabase();

    if (db) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query: any = { isApproved: true };

      if (service) {
        query.services = service;
      }

      const vendors = await VendorProfile.find(query)
        .populate('userId', 'name email')
        .sort({ rating: -1 });

      return Response.json({ success: true, vendors });
    } else {
      let filteredVendors = mockVendorProfiles.filter(vp => vp.isApproved);

      if (service) {
        filteredVendors = filteredVendors.filter(vp => vp.services.includes(service));
      }

      // Sort by rating
      filteredVendors.sort((a, b) => b.rating - a.rating);

      // Add user details
      const vendorsWithUser = filteredVendors.map(vp => {
        const user = mockUsers.find(u => u._id === vp.userId);
        return {
          ...vp,
          userId: user ? { _id: user._id, name: user.name, email: user.email } : null,
        };
      });

      return Response.json({ success: true, vendors: vendorsWithUser });
    }
  } catch (error) {
    console.error('Get vendors error:', error);
    return serverErrorResponse('Failed to get vendors');
  }
}
