import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Cart, Product } from '@/lib/models';
import { getCurrentUser, unauthorizedResponse, forbiddenResponse, badRequestResponse, serverErrorResponse } from '@/lib/auth';
import { mockCarts, mockProducts, mockVendorProfiles } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return unauthorizedResponse();
    }

    if (currentUser.role !== 'customer') {
      return forbiddenResponse('Only customers can access cart');
    }

    const db = await connectToDatabase();

    if (db) {
      let cart = await Cart.findOne({ user: currentUser.userId }).populate({
        path: 'items.product',
        select: 'name price imageUrl stock vendor',
        populate: { path: 'vendor', select: 'name' }
      });

      if (!cart) {
        cart = await Cart.create({ user: currentUser.userId, items: [] });
      }

      return Response.json({ success: true, cart });
    } else {
      const cart = mockCarts[currentUser.userId] || { items: [] };
      
      // Populate product details
      const populatedItems = cart.items.map(item => {
        const product = mockProducts.find(p => p._id === item.product);
        const vendor = product ? mockVendorProfiles.find(vp => vp.userId === product.vendor) : null;
        return {
          ...item,
          product: product ? {
            _id: product._id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            stock: product.stock,
            vendor: vendor?.businessName || 'Unknown Vendor',
          } : null,
        };
      }).filter(item => item.product !== null);

      return Response.json({ 
        success: true, 
        cart: { 
          user: currentUser.userId, 
          items: populatedItems 
        } 
      });
    }
  } catch (error) {
    console.error('Get cart error:', error);
    return serverErrorResponse('Failed to get cart');
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return unauthorizedResponse();
    }

    if (currentUser.role !== 'customer') {
      return forbiddenResponse('Only customers can add to cart');
    }

    const body = await request.json();
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return badRequestResponse('Please provide a product ID');
    }

    const db = await connectToDatabase();

    if (db) {
      const product = await Product.findById(productId);
      if (!product) {
        return badRequestResponse('Product not found');
      }

      if (!product.isActive) {
        return badRequestResponse('Product is not available');
      }

      if (product.stock < quantity) {
        return badRequestResponse('Not enough stock available');
      }

      let cart = await Cart.findOne({ user: currentUser.userId });

      if (!cart) {
        cart = new Cart({ user: currentUser.userId, items: [] });
      }

      const existingItemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
      );

      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }

      await cart.save();

      // Populate for response
      await cart.populate({
        path: 'items.product',
        select: 'name price imageUrl stock vendor',
        populate: { path: 'vendor', select: 'name' }
      });

      return Response.json({ success: true, cart });
    } else {
      const product = mockProducts.find(p => p._id === productId);
      if (!product) {
        return badRequestResponse('Product not found');
      }

      if (!product.isActive) {
        return badRequestResponse('Product is not available');
      }

      if (product.stock < quantity) {
        return badRequestResponse('Not enough stock available');
      }

      if (!mockCarts[currentUser.userId]) {
        mockCarts[currentUser.userId] = { items: [] };
      }

      const cart = mockCarts[currentUser.userId];
      const existingItemIndex = cart.items.findIndex(item => item.product === productId);

      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }

      // Populate product details for response
      const populatedItems = cart.items.map(item => {
        const prod = mockProducts.find(p => p._id === item.product);
        const vendor = prod ? mockVendorProfiles.find(vp => vp.userId === prod.vendor) : null;
        return {
          ...item,
          product: prod ? {
            _id: prod._id,
            name: prod.name,
            price: prod.price,
            imageUrl: prod.imageUrl,
            stock: prod.stock,
            vendor: vendor?.businessName || 'Unknown Vendor',
          } : null,
        };
      });

      return Response.json({ 
        success: true, 
        cart: { user: currentUser.userId, items: populatedItems } 
      });
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    return serverErrorResponse('Failed to add to cart');
  }
}
