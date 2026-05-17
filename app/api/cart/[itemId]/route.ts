import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Cart } from '@/lib/models';
import { getCurrentUser, unauthorizedResponse, forbiddenResponse, notFoundResponse, badRequestResponse, serverErrorResponse } from '@/lib/auth';
import { mockCarts, mockProducts, mockVendorProfiles } from '@/lib/mock-data';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return unauthorizedResponse();
    }

    if (currentUser.role !== 'customer') {
      return forbiddenResponse('Only customers can update cart');
    }

    const body = await request.json();
    const { quantity } = body;

    if (quantity === undefined || quantity < 0) {
      return badRequestResponse('Please provide a valid quantity');
    }

    const db = await connectToDatabase();

    if (db) {
      const cart = await Cart.findOne({ user: currentUser.userId });

      if (!cart) {
        return notFoundResponse('Cart not found');
      }

      const itemIndex = cart.items.findIndex(item => item.product.toString() === itemId);

      if (itemIndex === -1) {
        return notFoundResponse('Item not found in cart');
      }

      if (quantity === 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }

      await cart.save();

      await cart.populate({
        path: 'items.product',
        select: 'name price imageUrl stock vendor',
        populate: { path: 'vendor', select: 'name' }
      });

      return Response.json({ success: true, cart });
    } else {
      const cart = mockCarts[currentUser.userId];

      if (!cart) {
        return notFoundResponse('Cart not found');
      }

      const itemIndex = cart.items.findIndex(item => item.product === itemId);

      if (itemIndex === -1) {
        return notFoundResponse('Item not found in cart');
      }

      if (quantity === 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }

      // Populate product details for response
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
      });

      return Response.json({ 
        success: true, 
        cart: { user: currentUser.userId, items: populatedItems } 
      });
    }
  } catch (error) {
    console.error('Update cart item error:', error);
    return serverErrorResponse('Failed to update cart item');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return unauthorizedResponse();
    }

    if (currentUser.role !== 'customer') {
      return forbiddenResponse('Only customers can update cart');
    }

    const db = await connectToDatabase();

    if (db) {
      const cart = await Cart.findOne({ user: currentUser.userId });

      if (!cart) {
        return notFoundResponse('Cart not found');
      }

      const itemIndex = cart.items.findIndex(item => item.product.toString() === itemId);

      if (itemIndex === -1) {
        return notFoundResponse('Item not found in cart');
      }

      cart.items.splice(itemIndex, 1);
      await cart.save();

      await cart.populate({
        path: 'items.product',
        select: 'name price imageUrl stock vendor',
        populate: { path: 'vendor', select: 'name' }
      });

      return Response.json({ success: true, cart });
    } else {
      const cart = mockCarts[currentUser.userId];

      if (!cart) {
        return notFoundResponse('Cart not found');
      }

      const itemIndex = cart.items.findIndex(item => item.product === itemId);

      if (itemIndex === -1) {
        return notFoundResponse('Item not found in cart');
      }

      cart.items.splice(itemIndex, 1);

      // Populate product details for response
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
      });

      return Response.json({ 
        success: true, 
        cart: { user: currentUser.userId, items: populatedItems } 
      });
    }
  } catch (error) {
    console.error('Delete cart item error:', error);
    return serverErrorResponse('Failed to delete cart item');
  }
}
