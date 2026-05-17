import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Order } from '@/lib/models';
import { getCurrentUser, unauthorizedResponse, forbiddenResponse, notFoundResponse, badRequestResponse, serverErrorResponse } from '@/lib/auth';
import { mockOrders } from '@/lib/mock-data';

const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

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
      return forbiddenResponse('Only vendors and admins can update order status');
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !validStatuses.includes(status)) {
      return badRequestResponse(`Invalid status. Valid statuses are: ${validStatuses.join(', ')}`);
    }

    const db = await connectToDatabase();

    if (db) {
      const order = await Order.findById(id);

      if (!order) {
        return notFoundResponse('Order not found');
      }

      // Vendors can only update orders containing their products
      if (currentUser.role === 'vendor') {
        const hasVendorItems = order.items.some(item => item.vendor.toString() === currentUser.userId);
        if (!hasVendorItems) {
          return forbiddenResponse('You can only update orders containing your products');
        }
      }

      order.status = status;
      if (status === 'delivered') {
        order.paymentStatus = 'paid';
      }
      await order.save();

      return Response.json({ success: true, order });
    } else {
      const orderIndex = mockOrders.findIndex(o => o._id === id);

      if (orderIndex === -1) {
        return notFoundResponse('Order not found');
      }

      const order = mockOrders[orderIndex];

      // Vendors can only update orders containing their products
      if (currentUser.role === 'vendor') {
        const hasVendorItems = order.items.some(item => item.vendor === currentUser.userId);
        if (!hasVendorItems) {
          return forbiddenResponse('You can only update orders containing your products');
        }
      }

      mockOrders[orderIndex].status = status as typeof order.status;
      if (status === 'delivered') {
        mockOrders[orderIndex].paymentStatus = 'paid';
      }
      mockOrders[orderIndex].updatedAt = new Date();

      return Response.json({ success: true, order: mockOrders[orderIndex] });
    }
  } catch (error) {
    console.error('Update order status error:', error);
    return serverErrorResponse('Failed to update order status');
  }
}
