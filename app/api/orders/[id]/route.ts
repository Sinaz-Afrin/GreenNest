import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Order } from '@/lib/models';
import { getCurrentUser, unauthorizedResponse, forbiddenResponse, notFoundResponse, serverErrorResponse } from '@/lib/auth';
import { mockOrders, mockUsers } from '@/lib/mock-data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return unauthorizedResponse();
    }

    const db = await connectToDatabase();

    if (db) {
      const order = await Order.findById(id).populate('customer', 'name email address');

      if (!order) {
        return notFoundResponse('Order not found');
      }

      // Check access
      if (currentUser.role === 'customer' && order.customer._id.toString() !== currentUser.userId) {
        return forbiddenResponse('You can only view your own orders');
      }

      if (currentUser.role === 'vendor') {
        const hasVendorItems = order.items.some(item => item.vendor.toString() === currentUser.userId);
        if (!hasVendorItems) {
          return forbiddenResponse('You can only view orders containing your products');
        }
      }

      return Response.json({ success: true, order });
    } else {
      const order = mockOrders.find(o => o._id === id);

      if (!order) {
        return notFoundResponse('Order not found');
      }

      // Check access
      if (currentUser.role === 'customer' && order.customer !== currentUser.userId) {
        return forbiddenResponse('You can only view your own orders');
      }

      if (currentUser.role === 'vendor') {
        const hasVendorItems = order.items.some(item => item.vendor === currentUser.userId);
        if (!hasVendorItems) {
          return forbiddenResponse('You can only view orders containing your products');
        }
      }

      const customer = mockUsers.find(u => u._id === order.customer);

      return Response.json({ 
        success: true, 
        order: {
          ...order,
          customer: customer ? { _id: customer._id, name: customer.name, email: customer.email, address: customer.address } : null,
        }
      });
    }
  } catch (error) {
    console.error('Get order error:', error);
    return serverErrorResponse('Failed to get order');
  }
}
