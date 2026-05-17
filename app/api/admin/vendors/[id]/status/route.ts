import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { VendorProfile } from '@/lib/models';
import { getCurrentUser, unauthorizedResponse, forbiddenResponse, notFoundResponse, badRequestResponse, serverErrorResponse } from '@/lib/auth';
import { mockVendorProfiles } from '@/lib/mock-data';

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

    if (currentUser.role !== 'admin') {
      return forbiddenResponse('Only admins can update vendor status');
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return badRequestResponse('Invalid status. Valid statuses are: pending, approved, rejected');
    }

    const db = await connectToDatabase();

    if (db) {
      const vendorProfile = await VendorProfile.findById(id);

      if (!vendorProfile) {
        return notFoundResponse('Vendor profile not found');
      }

      vendorProfile.status = status;
      vendorProfile.isApproved = status === 'approved';
      await vendorProfile.save();

      return Response.json({ success: true, vendorProfile });
    } else {
      const vendorIndex = mockVendorProfiles.findIndex(vp => vp._id === id || vp.userId === id);

      if (vendorIndex === -1) {
        return notFoundResponse('Vendor profile not found');
      }

      mockVendorProfiles[vendorIndex].status = status;
      mockVendorProfiles[vendorIndex].isApproved = status === 'approved';

      return Response.json({ success: true, vendorProfile: mockVendorProfiles[vendorIndex] });
    }
  } catch (error) {
    console.error('Update vendor status error:', error);
    return serverErrorResponse('Failed to update vendor status');
  }
}
