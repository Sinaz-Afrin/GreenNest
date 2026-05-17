import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Category } from '@/lib/models';
import { getCurrentUser, unauthorizedResponse, forbiddenResponse, badRequestResponse, serverErrorResponse } from '@/lib/auth';
import { mockCategories } from '@/lib/mock-data';

export async function GET() {
  try {
    const db = await connectToDatabase();

    if (db) {
      const categories = await Category.find().sort({ name: 1 });
      return Response.json({ success: true, categories });
    } else {
      return Response.json({ success: true, categories: mockCategories });
    }
  } catch (error) {
    console.error('Get categories error:', error);
    return serverErrorResponse('Failed to get categories');
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return unauthorizedResponse();
    }

    if (currentUser.role !== 'admin') {
      return forbiddenResponse('Only admins can create categories');
    }

    const body = await request.json();
    const { name, imageUrl, description } = body;

    if (!name) {
      return badRequestResponse('Please provide a category name');
    }

    const db = await connectToDatabase();

    if (db) {
      const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
      if (existingCategory) {
        return badRequestResponse('Category already exists');
      }

      const category = await Category.create({
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        imageUrl,
        description,
      });

      return Response.json({ success: true, category }, { status: 201 });
    } else {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const existingCategory = mockCategories.find(c => c.slug === slug);
      if (existingCategory) {
        return badRequestResponse('Category already exists');
      }

      const newCategory = {
        _id: `cat${Date.now()}`,
        name,
        slug,
        imageUrl,
        description,
        createdAt: new Date(),
      };

      mockCategories.push(newCategory);

      return Response.json({ success: true, category: newCategory }, { status: 201 });
    }
  } catch (error) {
    console.error('Create category error:', error);
    return serverErrorResponse('Failed to create category');
  }
}
