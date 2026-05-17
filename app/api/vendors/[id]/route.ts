import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { VendorProfile } from '@/lib/models';
import { notFoundResponse, serverErrorResponse } from '@/lib/auth';
import { mockVendorProfiles, mockUsers } from '@/lib/mock-data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await connectToDatabase();

    if (db) {
      // Try to find by userId first, then by _id
      let vendor = await VendorProfile.findOne({ userId: id }).populate('userId', 'name email');
      
      if (!vendor) {
        vendor = await VendorProfile.findById(id).populate('userId', 'name email');
      }

      if (!vendor) {
        return notFoundResponse('Vendor not found');
      }

      return Response.json({ success: true, vendor });
    } else {
      // Try to find by userId first, then by _id
      let vendor = mockVendorProfiles.find(vp => vp.userId === id);
      
      if (!vendor) {
        vendor = mockVendorProfiles.find(vp => vp._id === id);
      }

      if (!vendor) {
        return notFoundResponse('Vendor not found');
      }

      const user = mockUsers.find(u => u._id === vendor!.userId);

      return Response.json({ 
        success: true, 
        vendor: {
          ...vendor,
          userId: user ? { _id: user._id, name: user.name, email: user.email } : null,
        }
      });
    }
  } catch (error) {
    console.error('Get vendor error:', error);
    return serverErrorResponse('Failed to get vendor');
  }
}
