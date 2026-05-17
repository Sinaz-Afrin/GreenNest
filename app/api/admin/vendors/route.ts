import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { VendorProfile } from '@/lib/models';
import { getCurrentUser, unauthorizedResponse, forbiddenResponse, serverErrorResponse } from '@/lib/auth';
import { mockVendorProfiles, mockUsers } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return unauthorizedResponse();
    }

    if (currentUser.role !== 'admin') {
      return forbiddenResponse('Only admins can access this endpoint');
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    const db = await connectToDatabase();

    if (db) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query: any = {};

      if (status) {
        query.status = status;
      }

      const vendors = await VendorProfile.find(query)
        .populate('userId', 'name email createdAt')
        .sort({ createdAt: -1 });

      return Response.json({ success: true, vendors });
    } else {
      let filteredVendors = [...mockVendorProfiles];

      if (status) {
        filteredVendors = filteredVendors.filter(vp => vp.status === status);
      }

      // Sort by creation date
      filteredVendors.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Add user details
      const vendorsWithUser = filteredVendors.map(vp => {
        const user = mockUsers.find(u => u._id === vp.userId);
        return {
          ...vp,
          userId: user ? { _id: user._id, name: user.name, email: user.email, createdAt: user.createdAt } : null,
        };
      });

      return Response.json({ success: true, vendors: vendorsWithUser });
    }
  } catch (error) {
    console.error('Get admin vendors error:', error);
    return serverErrorResponse('Failed to get vendors');
  }
}
