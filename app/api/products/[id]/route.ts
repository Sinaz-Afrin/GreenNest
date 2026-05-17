import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Product, Category, VendorProfile } from '@/lib/models';
import { getCurrentUser, unauthorizedResponse, forbiddenResponse, notFoundResponse, badRequestResponse, serverErrorResponse } from '@/lib/auth';
import { mockProducts, mockCategories, mockVendorProfiles, findVendorProfile } from '@/lib/mock-data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await connectToDatabase();

    if (db) {
      const product = await Product.findById(id)
        .populate('category', 'name slug')
        .populate('vendor', 'name');

      if (!product) {
        return notFoundResponse('Product not found');
      }

      const vendorProfile = await VendorProfile.findOne({ userId: product.vendor._id });

      return Response.json({ 
        success: true, 
        product: {
          ...product.toObject(),
          vendorProfile: vendorProfile ? {
            businessName: vendorProfile.businessName,
            rating: vendorProfile.rating,
          } : null,
        }
      });
    } else {
      const product = mockProducts.find(p => p._id === id);

      if (!product) {
        return notFoundResponse('Product not found');
      }

      const category = mockCategories.find(c => c._id === product.category);
      const vendorProfile = mockVendorProfiles.find(vp => vp.userId === product.vendor);

      return Response.json({ 
        success: true, 
        product: {
          ...product,
          category: category ? { _id: category._id, name: category.name, slug: category.slug } : null,
          vendorProfile: vendorProfile ? {
            businessName: vendorProfile.businessName,
            rating: vendorProfile.rating,
          } : null,
        }
      });
    }
  } catch (error) {
    console.error('Get product error:', error);
    return serverErrorResponse('Failed to get product');
  }
}

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

    if (currentUser.role !== 'vendor' && currentUser.role !== 'admin') {
      return forbiddenResponse('Only vendors can update products');
    }

    const db = await connectToDatabase();

    // Check if vendor is approved (for vendors)
    if (currentUser.role === 'vendor') {
      if (db) {
        const vendorProfile = await VendorProfile.findOne({ userId: currentUser.userId });
        if (!vendorProfile?.isApproved) {
          return forbiddenResponse('Your vendor account is not approved yet');
        }
      } else {
        const vendorProfile = findVendorProfile(currentUser.userId);
        if (!vendorProfile?.isApproved) {
          return forbiddenResponse('Your vendor account is not approved yet');
        }
      }
    }

    const body = await request.json();

    if (db) {
      const product = await Product.findById(id);

      if (!product) {
        return notFoundResponse('Product not found');
      }

      // Only allow vendor to update their own products (unless admin)
      if (currentUser.role === 'vendor' && product.vendor.toString() !== currentUser.userId) {
        return forbiddenResponse('You can only update your own products');
      }

      // Update allowed fields
      const allowedFields = ['name', 'description', 'price', 'stock', 'imageUrl', 'careInstructions', 'category', 'isActive'];
      allowedFields.forEach(field => {
        if (body[field] !== undefined) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (product as any)[field] = body[field];
        }
      });

      await product.save();

      return Response.json({ success: true, product });
    } else {
      const productIndex = mockProducts.findIndex(p => p._id === id);

      if (productIndex === -1) {
        return notFoundResponse('Product not found');
      }

      const product = mockProducts[productIndex];

      // Only allow vendor to update their own products (unless admin)
      if (currentUser.role === 'vendor' && product.vendor !== currentUser.userId) {
        return forbiddenResponse('You can only update your own products');
      }

      // Update allowed fields
      const allowedFields = ['name', 'description', 'price', 'stock', 'imageUrl', 'careInstructions', 'category', 'isActive'];
      allowedFields.forEach(field => {
        if (body[field] !== undefined) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (mockProducts[productIndex] as any)[field] = body[field];
        }
      });

      return Response.json({ success: true, product: mockProducts[productIndex] });
    }
  } catch (error) {
    console.error('Update product error:', error);
    return serverErrorResponse('Failed to update product');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return unauthorizedResponse();
    }

    if (currentUser.role !== 'vendor' && currentUser.role !== 'admin') {
      return forbiddenResponse('Only vendors can delete products');
    }

    const db = await connectToDatabase();

    if (db) {
      const product = await Product.findById(id);

      if (!product) {
        return notFoundResponse('Product not found');
      }

      // Only allow vendor to delete their own products (unless admin)
      if (currentUser.role === 'vendor' && product.vendor.toString() !== currentUser.userId) {
        return forbiddenResponse('You can only delete your own products');
      }

      await Product.findByIdAndDelete(id);

      return Response.json({ success: true, message: 'Product deleted' });
    } else {
      const productIndex = mockProducts.findIndex(p => p._id === id);

      if (productIndex === -1) {
        return notFoundResponse('Product not found');
      }

      const product = mockProducts[productIndex];

      // Only allow vendor to delete their own products (unless admin)
      if (currentUser.role === 'vendor' && product.vendor !== currentUser.userId) {
        return forbiddenResponse('You can only delete your own products');
      }

      mockProducts.splice(productIndex, 1);

      return Response.json({ success: true, message: 'Product deleted' });
    }
  } catch (error) {
    console.error('Delete product error:', error);
    return serverErrorResponse('Failed to delete product');
  }
}
