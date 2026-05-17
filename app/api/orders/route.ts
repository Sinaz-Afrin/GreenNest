import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Order, Cart, Product } from '@/lib/models';
import { getCurrentUser, unauthorizedResponse, forbiddenResponse, badRequestResponse, serverErrorResponse } from '@/lib/auth';
import { mockOrders, mockCarts, mockProducts, mockUsers, mockVendorProfiles } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return unauthorizedResponse();
    }

    const db = await connectToDatabase();

    if (db) {
      let query = {};

      if (currentUser.role === 'customer') {
        query = { customer: currentUser.userId };
      } else if (currentUser.role === 'vendor') {
        query = { 'items.vendor': currentUser.userId };
      }
      // Admin gets all orders

      const orders = await Order.find(query)
        .populate('customer', 'name email')
        .sort({ createdAt: -1 });

      return Response.json({ success: true, orders });
    } else {
      let filteredOrders = [...mockOrders];

      if (currentUser.role === 'customer') {
        filteredOrders = filteredOrders.filter(o => o.customer === currentUser.userId);
      } else if (currentUser.role === 'vendor') {
        filteredOrders = filteredOrders.filter(o => 
          o.items.some(item => item.vendor === currentUser.userId)
        );
      }

      // Add customer details
      const ordersWithCustomer = filteredOrders.map(order => {
        const customer = mockUsers.find(u => u._id === order.customer);
        return {
          ...order,
          customer: customer ? { _id: customer._id, name: customer.name, email: customer.email } : null,
        };
      });

      return Response.json({ success: true, orders: ordersWithCustomer });
    }
  } catch (error) {
    console.error('Get orders error:', error);
    return serverErrorResponse('Failed to get orders');
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return unauthorizedResponse();
    }

    if (currentUser.role !== 'customer') {
      return forbiddenResponse('Only customers can place orders');
    }

    const body = await request.json();
    const { deliveryAddress, notes } = body;

    if (!deliveryAddress) {
      return badRequestResponse('Please provide a delivery address');
    }

    const db = await connectToDatabase();

    if (db) {
      const cart = await Cart.findOne({ user: currentUser.userId }).populate('items.product');

      if (!cart || cart.items.length === 0) {
        return badRequestResponse('Your cart is empty');
      }

      // Verify all products are available and have enough stock
      const orderItems = [];
      let totalAmount = 0;

      for (const item of cart.items) {
        const product = await Product.findById(item.product);
        if (!product || !product.isActive) {
          return badRequestResponse(`Product ${item.product} is no longer available`);
        }
        if (product.stock < item.quantity) {
          return badRequestResponse(`Not enough stock for ${product.name}`);
        }

        orderItems.push({
          product: product._id,
          productName: product.name,
          productImage: product.imageUrl,
          quantity: item.quantity,
          price: product.price,
          vendor: product.vendor,
        });

        totalAmount += product.price * item.quantity;

        // Update stock
        product.stock -= item.quantity;
        await product.save();
      }

      const order = await Order.create({
        customer: currentUser.userId,
        items: orderItems,
        totalAmount,
        deliveryFee: 5.99,
        deliveryAddress,
        status: 'pending',
        paymentStatus: 'pending',
        notes,
      });

      // Clear cart
      cart.items = [];
      await cart.save();

      return Response.json({ success: true, order }, { status: 201 });
    } else {
      const cart = mockCarts[currentUser.userId];

      if (!cart || cart.items.length === 0) {
        return badRequestResponse('Your cart is empty');
      }

      // Verify all products and build order items
      const orderItems = [];
      let totalAmount = 0;

      for (const item of cart.items) {
        const product = mockProducts.find(p => p._id === item.product);
        if (!product || !product.isActive) {
          return badRequestResponse(`Product ${item.product} is no longer available`);
        }
        if (product.stock < item.quantity) {
          return badRequestResponse(`Not enough stock for ${product.name}`);
        }

        orderItems.push({
          product: product._id,
          productName: product.name,
          productImage: product.imageUrl,
          quantity: item.quantity,
          price: product.price,
          vendor: product.vendor,
        });

        totalAmount += product.price * item.quantity;

        // Update stock
        const productIndex = mockProducts.findIndex(p => p._id === item.product);
        mockProducts[productIndex].stock -= item.quantity;
      }

      const newOrder = {
        _id: `order${Date.now()}`,
        customer: currentUser.userId,
        items: orderItems,
        totalAmount,
        deliveryFee: 5.99,
        deliveryAddress,
        status: 'pending' as const,
        paymentStatus: 'pending' as const,
        notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOrders.push(newOrder);

      // Clear cart
      mockCarts[currentUser.userId] = { items: [] };

      return Response.json({ success: true, order: newOrder }, { status: 201 });
    }
  } catch (error) {
    console.error('Create order error:', error);
    return serverErrorResponse('Failed to create order');
  }
}
