import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User, VendorProfile } from '@/lib/models';
import { getCurrentUser, unauthorizedResponse, serverErrorResponse } from '@/lib/auth';
import { findUserById, findVendorProfile } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return unauthorizedResponse();
    }

    const db = await connectToDatabase();

    if (db) {
      const user = await User.findById(currentUser.userId);
      
      if (!user) {
        return unauthorizedResponse('User not found');
      }

      let vendorProfile = null;
      if (user.role === 'vendor') {
        vendorProfile = await VendorProfile.findOne({ userId: user._id });
      }

      return Response.json({
        success: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          address: user.address,
          phone: user.phone,
          createdAt: user.createdAt,
        },
        vendorProfile: vendorProfile ? {
          id: vendorProfile._id.toString(),
          businessName: vendorProfile.businessName,
          services: vendorProfile.services,
          availability: vendorProfile.availability,
          hourlyPrice: vendorProfile.hourlyPrice,
          isApproved: vendorProfile.isApproved,
          status: vendorProfile.status,
          earnings: vendorProfile.earnings,
          rating: vendorProfile.rating,
          totalReviews: vendorProfile.totalReviews,
          bio: vendorProfile.bio,
          imageUrl: vendorProfile.imageUrl,
        } : null,
      });
    } else {
      const user = findUserById(currentUser.userId);
      
      if (!user) {
        return unauthorizedResponse('User not found');
      }

      let vendorProfile = null;
      if (user.role === 'vendor') {
        vendorProfile = findVendorProfile(user._id);
      }

      return Response.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          address: user.address,
          createdAt: user.createdAt,
        },
        vendorProfile: vendorProfile ? {
          id: vendorProfile._id,
          businessName: vendorProfile.businessName,
          services: vendorProfile.services,
          availability: vendorProfile.availability,
          hourlyPrice: vendorProfile.hourlyPrice,
          isApproved: vendorProfile.isApproved,
          status: vendorProfile.status,
          earnings: vendorProfile.earnings,
          rating: vendorProfile.rating,
          totalReviews: vendorProfile.totalReviews,
          bio: vendorProfile.bio,
          imageUrl: vendorProfile.imageUrl,
        } : null,
      });
    }
  } catch (error) {
    console.error('Get user error:', error);
    return serverErrorResponse('Failed to get user');
  }
}
