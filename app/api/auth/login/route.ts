import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User, VendorProfile } from '@/lib/models';
import { createToken, badRequestResponse, serverErrorResponse, unauthorizedResponse } from '@/lib/auth';
import { findUserByEmail, findVendorProfile } from '@/lib/mock-data';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return badRequestResponse('Please provide email and password');
    }

    const db = await connectToDatabase();

    if (db) {
      // MongoDB connected - use real database
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      
      if (!user) {
        return unauthorizedResponse('Invalid credentials');
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return unauthorizedResponse('Invalid credentials');
      }

      let vendorProfile = null;
      if (user.role === 'vendor') {
        vendorProfile = await VendorProfile.findOne({ userId: user._id });
      }

      const token = await createToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      return Response.json({
        success: true,
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          address: user.address,
        },
        vendorProfile: vendorProfile ? {
          businessName: vendorProfile.businessName,
          isApproved: vendorProfile.isApproved,
          status: vendorProfile.status,
        } : null,
      });
    } else {
      // Use mock data
      const user = findUserByEmail(email.toLowerCase());
      
      if (!user) {
        return unauthorizedResponse('Invalid credentials');
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return unauthorizedResponse('Invalid credentials');
      }

      let vendorProfile = null;
      if (user.role === 'vendor') {
        vendorProfile = findVendorProfile(user._id);
      }

      const token = await createToken({
        userId: user._id,
        email: user.email,
        role: user.role,
      });

      return Response.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          address: user.address,
        },
        vendorProfile: vendorProfile ? {
          businessName: vendorProfile.businessName,
          isApproved: vendorProfile.isApproved,
          status: vendorProfile.status,
        } : null,
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return serverErrorResponse('Login failed');
  }
}
