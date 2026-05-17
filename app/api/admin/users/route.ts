import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models';
import { getCurrentUser, unauthorizedResponse, forbiddenResponse, serverErrorResponse } from '@/lib/auth';
import { mockUsers } from '@/lib/mock-data';

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
    const role = searchParams.get('role');

    const db = await connectToDatabase();

    if (db) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query: any = {};

      if (role) {
        query.role = role;
      }

      const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 });

      return Response.json({ success: true, users });
    } else {
      let filteredUsers = [...mockUsers];

      if (role) {
        filteredUsers = filteredUsers.filter(u => u.role === role);
      }

      // Sort by creation date
      filteredUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Remove password from response
      const usersWithoutPassword = filteredUsers.map(({ password, ...user }) => user);

      return Response.json({ success: true, users: usersWithoutPassword });
    }
  } catch (error) {
    console.error('Get admin users error:', error);
    return serverErrorResponse('Failed to get users');
  }
}
