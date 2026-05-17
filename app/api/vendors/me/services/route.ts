import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { VendorProfile } from '@/lib/models';
import { getCurrentUser, unauthorizedResponse, forbiddenResponse, notFoundResponse, serverErrorResponse } from '@/lib/auth';
import { mockVendorProfiles } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return unauthorizedResponse();
    }

    if (currentUser.role !== 'vendor') {
      return forbiddenResponse('Only vendors can access this endpoint');
    }

    const db = await connectToDatabase();

    if (db) {
      const vendorProfile = await VendorProfile.findOne({ userId: currentUser.userId });

      if (!vendorProfile) {
        return notFoundResponse('Vendor profile not found');
      }

      return Response.json({ 
        success: true, 
        services: vendorProfile.services,
        availability: vendorProfile.availability,
        hourlyPrice: vendorProfile.hourlyPrice,
      });
    } else {
      const vendorProfile = mockVendorProfiles.find(vp => vp.userId === currentUser.userId);

      if (!vendorProfile) {
        return notFoundResponse('Vendor profile not found');
      }

      return Response.json({ 
        success: true, 
        services: vendorProfile.services,
        availability: vendorProfile.availability,
        hourlyPrice: vendorProfile.hourlyPrice,
      });
    }
  } catch (error) {
    console.error('Get vendor services error:', error);
    return serverErrorResponse('Failed to get vendor services');
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return unauthorizedResponse();
    }

    if (currentUser.role !== 'vendor') {
      return forbiddenResponse('Only vendors can update services');
    }

    const body = await request.json();
    const { services, availability, hourlyPrice, bio, imageUrl } = body;

    const db = await connectToDatabase();

    if (db) {
      const vendorProfile = await VendorProfile.findOne({ userId: currentUser.userId });

      if (!vendorProfile) {
        return notFoundResponse('Vendor profile not found');
      }

      if (services !== undefined) vendorProfile.services = services;
      if (availability !== undefined) vendorProfile.availability = availability;
      if (hourlyPrice !== undefined) vendorProfile.hourlyPrice = hourlyPrice;
      if (bio !== undefined) vendorProfile.bio = bio;
      if (imageUrl !== undefined) vendorProfile.imageUrl = imageUrl;

      await vendorProfile.save();

      return Response.json({ success: true, vendorProfile });
    } else {
      const vendorIndex = mockVendorProfiles.findIndex(vp => vp.userId === currentUser.userId);

      if (vendorIndex === -1) {
        return notFoundResponse('Vendor profile not found');
      }

      if (services !== undefined) mockVendorProfiles[vendorIndex].services = services;
      if (availability !== undefined) mockVendorProfiles[vendorIndex].availability = availability;
      if (hourlyPrice !== undefined) mockVendorProfiles[vendorIndex].hourlyPrice = hourlyPrice;
      if (bio !== undefined) mockVendorProfiles[vendorIndex].bio = bio;
      if (imageUrl !== undefined) mockVendorProfiles[vendorIndex].imageUrl = imageUrl;

      return Response.json({ success: true, vendorProfile: mockVendorProfiles[vendorIndex] });
    }
  } catch (error) {
    console.error('Update vendor services error:', error);
    return serverErrorResponse('Failed to update vendor services');
  }
}
