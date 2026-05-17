import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Product, Category, VendorProfile } from '@/lib/models';
import { getCurrentUser, unauthorizedResponse, forbiddenResponse, badRequestResponse, serverErrorResponse } from '@/lib/auth';
import { mockProducts, mockCategories, findVendorProfile, mockVendorProfiles } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort');
    const vendor = searchParams.get('vendor');

    const db = await connectToDatabase();

    if (db) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query: any = { isActive: true };

      if (category) {
        const categoryDoc = await Category.findOne({ slug: category });
        if (categoryDoc) {
          query.category = categoryDoc._id;
        }
      }

      if (vendor) {
        query.vendor = vendor;
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
      }

      let sortOption = {};
      switch (sort) {
        case 'price-asc':
          sortOption = { price: 1 };
          break;
        case 'price-desc':
          sortOption = { price: -1 };
          break;
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }

      const products = await Product.find(query)
        .populate('category', 'name slug')
        .populate('vendor', 'name')
        .sort(sortOption);

      return Response.json({ success: true, products });
    } else {
      let filteredProducts = mockProducts.filter(p => p.isActive);

      if (category) {
        const categoryDoc = mockCategories.find(c => c.slug === category);
        if (categoryDoc) {
          filteredProducts = filteredProducts.filter(p => p.category === categoryDoc._id);
        }
      }

      if (vendor) {
        filteredProducts = filteredProducts.filter(p => p.vendor === vendor);
      }

      if (search) {
        const searchLower = search.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(searchLower) || 
          p.description.toLowerCase().includes(searchLower)
        );
      }

      if (minPrice) {
        filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(minPrice));
      }

      if (maxPrice) {
        filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
      }

      switch (sort) {
        case 'price-asc':
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
        default:
          filteredProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      // Add category and vendor names
      const productsWithDetails = filteredProducts.map(p => {
        const cat = mockCategories.find(c => c._id === p.category);
        const vendorProfile = mockVendorProfiles.find(vp => vp.userId === p.vendor);
        return {
          ...p,
          category: cat ? { _id: cat._id, name: cat.name, slug: cat.slug } : null,
          vendorName: vendorProfile?.businessName || 'Unknown Vendor',
        };
      });

      return Response.json({ success: true, products: productsWithDetails });
    }
  } catch (error) {
    console.error('Get products error:', error);
    return serverErrorResponse('Failed to get products');
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return unauthorizedResponse();
    }

    if (currentUser.role !== 'vendor') {
      return forbiddenResponse('Only vendors can create products');
    }

    const db = await connectToDatabase();

    // Check if vendor is approved
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

    const body = await request.json();
    const { name, description, price, stock, imageUrl, careInstructions, category } = body;

    if (!name || !description || price === undefined || !imageUrl || !category) {
      return badRequestResponse('Please provide all required fields');
    }

    if (db) {
      const categoryDoc = await Category.findById(category);
      if (!categoryDoc) {
        return badRequestResponse('Invalid category');
      }

      const product = await Product.create({
        name,
        description,
        price,
        stock: stock || 0,
        imageUrl,
        careInstructions,
        category: categoryDoc._id,
        vendor: currentUser.userId,
        isActive: true,
      });

      return Response.json({ success: true, product }, { status: 201 });
    } else {
      const categoryDoc = mockCategories.find(c => c._id === category);
      if (!categoryDoc) {
        return badRequestResponse('Invalid category');
      }

      const newProduct = {
        _id: `prod${Date.now()}`,
        name,
        description,
        price,
        stock: stock || 0,
        imageUrl,
        careInstructions,
        category,
        vendor: currentUser.userId,
        isActive: true,
        rating: 0,
        totalReviews: 0,
        createdAt: new Date(),
      };

      mockProducts.push(newProduct);

      return Response.json({ success: true, product: newProduct }, { status: 201 });
    }
  } catch (error) {
    console.error('Create product error:', error);
    return serverErrorResponse('Failed to create product');
  }
}
