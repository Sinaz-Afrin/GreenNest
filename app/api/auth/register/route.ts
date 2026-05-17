import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User, VendorProfile } from '@/lib/models';
import { createToken, badRequestResponse, serverErrorResponse } from '@/lib/auth';
import { mockUsers, mockVendorProfiles, findUserByEmail } from '@/lib/mock-data';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role, businessName, address } = body;

    if (!name || !email || !password) {
      return badRequestResponse('Please provide name, email, and password');
    }

    if (role === 'vendor' && !businessName) {
      return badRequestResponse('Please provide a business name for vendor registration');
    }

    const db = await connectToDatabase();

    if (db) {
      // MongoDB connected - use real database
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return badRequestResponse('Email already registered');
      }

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role: role || 'customer',
        address,
      });

      if (role === 'vendor') {
        await VendorProfile.create({
          userId: user._id,
          businessName,
          services: [],
          hourlyPrice: 0,
          isApproved: false,
          status: 'pending',
        });
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
        },
        message: role === 'vendor' ? 'Registration successful. Your vendor account is pending admin approval.' : 'Registration successful',
      });
    } else {
      // Use mock data
      const existingUser = findUserByEmail(email.toLowerCase());
      if (existingUser) {
        return badRequestResponse('Email already registered');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUserId = `user${Date.now()}`;
      
      const newUser = {
        _id: newUserId,
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: (role || 'customer') as 'customer' | 'vendor' | 'admin',
        address,
        createdAt: new Date(),
      };
      
      mockUsers.push(newUser);

      if (role === 'vendor') {
        mockVendorProfiles.push({
          _id: `vp${Date.now()}`,
          userId: newUserId,
          businessName,
          services: [],
          availability: {
            monday: { am: false, pm: false },
            tuesday: { am: false, pm: false },
            wednesday: { am: false, pm: false },
            thursday: { am: false, pm: false },
            friday: { am: false, pm: false },
            saturday: { am: false, pm: false },
            sunday: { am: false, pm: false },
          },
          hourlyPrice: 0,
          isApproved: false,
          status: 'pending',
          earnings: 0,
          rating: 0,
          totalReviews: 0,
          createdAt: new Date(),
        });
      }

      const token = await createToken({
        userId: newUserId,
        email: newUser.email,
        role: newUser.role,
      });

      return Response.json({
        success: true,
        token,
        user: {
          id: newUserId,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        message: role === 'vendor' ? 'Registration successful. Your vendor account is pending admin approval.' : 'Registration successful',
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return serverErrorResponse('Registration failed');
  }
}
