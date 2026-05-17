// Mock data for when MongoDB is not connected
import bcrypt from 'bcryptjs';

const hashedPassword = bcrypt.hashSync('password123', 10);
const adminPassword = bcrypt.hashSync('admin123', 10);
const customerPassword = bcrypt.hashSync('customer123', 10);

export const mockUsers = [
  {
    _id: 'admin001',
    name: 'Admin User',
    email: 'admin@greennest.com',
    password: adminPassword,
    role: 'admin' as const,
    address: '123 Admin Street, Green City',
    createdAt: new Date('2024-01-01'),
  },
  {
    _id: 'vendor001',
    name: 'Garden Masters',
    email: 'vendor1@greennest.com',
    password: hashedPassword,
    role: 'vendor' as const,
    address: '456 Garden Avenue, Plant Town',
    createdAt: new Date('2024-01-15'),
  },
  {
    _id: 'vendor002',
    name: 'Plant Paradise',
    email: 'vendor2@greennest.com',
    password: hashedPassword,
    role: 'vendor' as const,
    address: '789 Nursery Road, Bloom City',
    createdAt: new Date('2024-01-20'),
  },
  {
    _id: 'customer001',
    name: 'John Doe',
    email: 'customer@greennest.com',
    password: customerPassword,
    role: 'customer' as const,
    address: '321 Home Lane, Suburb Area',
    createdAt: new Date('2024-02-01'),
  },
];

export const mockVendorProfiles = [
  {
    _id: 'vp001',
    userId: 'vendor001',
    businessName: 'Garden Masters',
    services: ['Home Gardening', 'Lawn Maintenance', 'Plant Care'],
    availability: {
      monday: { am: true, pm: true },
      tuesday: { am: true, pm: true },
      wednesday: { am: true, pm: false },
      thursday: { am: true, pm: true },
      friday: { am: true, pm: true },
      saturday: { am: true, pm: false },
      sunday: { am: false, pm: false },
    },
    hourlyPrice: 35,
    isApproved: true,
    status: 'approved' as const,
    earnings: 2500,
    rating: 4.8,
    totalReviews: 45,
    bio: 'Professional gardening services with 10+ years of experience. We specialize in creating beautiful outdoor spaces.',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
    createdAt: new Date('2024-01-15'),
  },
  {
    _id: 'vp002',
    userId: 'vendor002',
    businessName: 'Plant Paradise',
    services: ['Plant Care', 'Pot Arrangement'],
    availability: {
      monday: { am: true, pm: true },
      tuesday: { am: false, pm: true },
      wednesday: { am: true, pm: true },
      thursday: { am: true, pm: true },
      friday: { am: true, pm: true },
      saturday: { am: true, pm: true },
      sunday: { am: false, pm: false },
    },
    hourlyPrice: 40,
    isApproved: true,
    status: 'approved' as const,
    earnings: 3200,
    rating: 4.9,
    totalReviews: 62,
    bio: 'Expert plant care and beautiful pot arrangements. Let us transform your space with greenery.',
    imageUrl: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&h=400&fit=crop',
    createdAt: new Date('2024-01-20'),
  },
];

export const mockCategories = [
  {
    _id: 'cat001',
    name: 'Plants',
    slug: 'plants',
    imageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=300&fit=crop',
    description: 'Beautiful indoor and outdoor plants',
    createdAt: new Date('2024-01-01'),
  },
  {
    _id: 'cat002',
    name: 'Seeds',
    slug: 'seeds',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
    description: 'Quality seeds for your garden',
    createdAt: new Date('2024-01-01'),
  },
  {
    _id: 'cat003',
    name: 'Pots',
    slug: 'pots',
    imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=300&fit=crop',
    description: 'Decorative and functional pots',
    createdAt: new Date('2024-01-01'),
  },
  {
    _id: 'cat004',
    name: 'Tools',
    slug: 'tools',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
    description: 'Essential gardening tools',
    createdAt: new Date('2024-01-01'),
  },
];

export const mockProducts = [
  {
    _id: 'prod001',
    name: 'Monstera Deliciosa',
    description: 'The Swiss Cheese Plant is a stunning tropical houseplant with unique split leaves. Perfect for adding a bold, tropical touch to any room.',
    price: 45.99,
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45c8f6e7c1e?w=600&h=600&fit=crop',
    careInstructions: 'Water when top inch of soil is dry. Bright indirect light. Mist leaves occasionally.',
    category: 'cat001',
    vendor: 'vendor001',
    isActive: true,
    rating: 4.8,
    totalReviews: 23,
    createdAt: new Date('2024-02-01'),
  },
  {
    _id: 'prod002',
    name: 'Snake Plant',
    description: 'Sansevieria is one of the most low-maintenance plants available. Perfect for beginners and busy plant parents.',
    price: 29.99,
    stock: 40,
    imageUrl: 'https://images.unsplash.com/photo-1593482892290-f54927ae1bb6?w=600&h=600&fit=crop',
    careInstructions: 'Water every 2-3 weeks. Tolerates low light. Drought tolerant.',
    category: 'cat001',
    vendor: 'vendor001',
    isActive: true,
    rating: 4.9,
    totalReviews: 45,
    createdAt: new Date('2024-02-05'),
  },
  {
    _id: 'prod003',
    name: 'Pothos Golden',
    description: 'A beautiful trailing plant with heart-shaped leaves. Easy to grow and perfect for hanging baskets.',
    price: 19.99,
    stock: 60,
    imageUrl: 'https://images.unsplash.com/photo-1572688484438-313a6e50c333?w=600&h=600&fit=crop',
    careInstructions: 'Water when soil is dry. Moderate to bright indirect light. Trim to control length.',
    category: 'cat001',
    vendor: 'vendor002',
    isActive: true,
    rating: 4.7,
    totalReviews: 38,
    createdAt: new Date('2024-02-10'),
  },
  {
    _id: 'prod004',
    name: 'Tomato Seeds - Heirloom Mix',
    description: 'A diverse mix of heirloom tomato varieties. Grow your own delicious tomatoes at home.',
    price: 8.99,
    stock: 100,
    imageUrl: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600&h=600&fit=crop',
    careInstructions: 'Plant in spring. Full sun. Water regularly. Harvest when ripe.',
    category: 'cat002',
    vendor: 'vendor001',
    isActive: true,
    rating: 4.6,
    totalReviews: 28,
    createdAt: new Date('2024-02-15'),
  },
  {
    _id: 'prod005',
    name: 'Herb Garden Seed Kit',
    description: 'Start your own herb garden with this complete kit including basil, parsley, cilantro, and mint seeds.',
    price: 15.99,
    stock: 75,
    imageUrl: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&h=600&fit=crop',
    careInstructions: 'Plant indoors or outdoors. Moderate water. Harvest leaves as needed.',
    category: 'cat002',
    vendor: 'vendor002',
    isActive: true,
    rating: 4.8,
    totalReviews: 52,
    createdAt: new Date('2024-02-20'),
  },
  {
    _id: 'prod006',
    name: 'Ceramic Planter - White',
    description: 'Modern minimalist ceramic planter with drainage hole. Perfect for small to medium plants.',
    price: 24.99,
    stock: 35,
    imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=600&fit=crop',
    careInstructions: 'Includes drainage hole and saucer. Suitable for indoor use.',
    category: 'cat003',
    vendor: 'vendor001',
    isActive: true,
    rating: 4.5,
    totalReviews: 19,
    createdAt: new Date('2024-02-25'),
  },
  {
    _id: 'prod007',
    name: 'Terracotta Pot Set',
    description: 'Set of 3 classic terracotta pots in varying sizes. Timeless design for any plant collection.',
    price: 32.99,
    stock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&h=600&fit=crop',
    careInstructions: 'Porous material allows air flow. May need more frequent watering.',
    category: 'cat003',
    vendor: 'vendor002',
    isActive: true,
    rating: 4.7,
    totalReviews: 31,
    createdAt: new Date('2024-03-01'),
  },
  {
    _id: 'prod008',
    name: 'Garden Tool Set - 5 Piece',
    description: 'Essential gardening tools including trowel, cultivator, weeder, transplanter, and pruning shears.',
    price: 39.99,
    stock: 45,
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop',
    careInstructions: 'Clean after use. Store in dry place. Oil metal parts occasionally.',
    category: 'cat004',
    vendor: 'vendor001',
    isActive: true,
    rating: 4.9,
    totalReviews: 67,
    createdAt: new Date('2024-03-05'),
  },
];

export const mockOrders = [
  {
    _id: 'order001',
    customer: 'customer001',
    items: [
      {
        product: 'prod001',
        productName: 'Monstera Deliciosa',
        productImage: 'https://images.unsplash.com/photo-1614594975525-e45c8f6e7c1e?w=600&h=600&fit=crop',
        quantity: 1,
        price: 45.99,
        vendor: 'vendor001',
      },
      {
        product: 'prod006',
        productName: 'Ceramic Planter - White',
        productImage: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=600&fit=crop',
        quantity: 2,
        price: 24.99,
        vendor: 'vendor001',
      },
    ],
    totalAmount: 95.97,
    deliveryFee: 5.99,
    deliveryAddress: '321 Home Lane, Suburb Area',
    status: 'delivered' as const,
    paymentStatus: 'paid' as const,
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-15'),
  },
  {
    _id: 'order002',
    customer: 'customer001',
    items: [
      {
        product: 'prod002',
        productName: 'Snake Plant',
        productImage: 'https://images.unsplash.com/photo-1593482892290-f54927ae1bb6?w=600&h=600&fit=crop',
        quantity: 1,
        price: 29.99,
        vendor: 'vendor001',
      },
    ],
    totalAmount: 29.99,
    deliveryFee: 5.99,
    deliveryAddress: '321 Home Lane, Suburb Area',
    status: 'shipped' as const,
    paymentStatus: 'paid' as const,
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date('2024-03-22'),
  },
  {
    _id: 'order003',
    customer: 'customer001',
    items: [
      {
        product: 'prod005',
        productName: 'Herb Garden Seed Kit',
        productImage: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&h=600&fit=crop',
        quantity: 2,
        price: 15.99,
        vendor: 'vendor002',
      },
    ],
    totalAmount: 31.98,
    deliveryFee: 5.99,
    deliveryAddress: '321 Home Lane, Suburb Area',
    status: 'pending' as const,
    paymentStatus: 'pending' as const,
    createdAt: new Date('2024-03-25'),
    updatedAt: new Date('2024-03-25'),
  },
];

export const mockBookings = [
  {
    _id: 'booking001',
    customer: 'customer001',
    vendor: 'vendor001',
    serviceType: 'Home Gardening',
    date: new Date('2024-04-01'),
    timeSlot: 'morning' as const,
    address: '321 Home Lane, Suburb Area',
    status: 'completed' as const,
    amount: 105,
    createdAt: new Date('2024-03-25'),
    updatedAt: new Date('2024-04-01'),
  },
  {
    _id: 'booking002',
    customer: 'customer001',
    vendor: 'vendor002',
    serviceType: 'Plant Care',
    date: new Date('2024-04-15'),
    timeSlot: 'afternoon' as const,
    address: '321 Home Lane, Suburb Area',
    status: 'confirmed' as const,
    amount: 80,
    createdAt: new Date('2024-04-10'),
    updatedAt: new Date('2024-04-11'),
  },
];

export const mockCarts: Record<string, { items: { product: string; quantity: number }[] }> = {
  customer001: {
    items: [
      { product: 'prod003', quantity: 2 },
      { product: 'prod008', quantity: 1 },
    ],
  },
};

// Helper functions to work with mock data
export function findUserByEmail(email: string) {
  return mockUsers.find(u => u.email === email);
}

export function findUserById(id: string) {
  return mockUsers.find(u => u._id === id);
}

export function findVendorProfile(userId: string) {
  return mockVendorProfiles.find(vp => vp.userId === userId);
}

export function getApprovedVendors() {
  return mockVendorProfiles.filter(vp => vp.isApproved);
}

export function findCategoryById(id: string) {
  return mockCategories.find(c => c._id === id);
}

export function findCategoryBySlug(slug: string) {
  return mockCategories.find(c => c.slug === slug);
}

export function findProductById(id: string) {
  return mockProducts.find(p => p._id === id);
}

export function getProductsByCategory(categoryId: string) {
  return mockProducts.filter(p => p.category === categoryId && p.isActive);
}

export function getProductsByVendor(vendorId: string) {
  return mockProducts.filter(p => p.vendor === vendorId);
}

export function getOrdersByCustomer(customerId: string) {
  return mockOrders.filter(o => o.customer === customerId);
}

export function getOrdersByVendor(vendorId: string) {
  return mockOrders.filter(o => o.items.some(item => item.vendor === vendorId));
}

export function getBookingsByCustomer(customerId: string) {
  return mockBookings.filter(b => b.customer === customerId);
}

export function getBookingsByVendor(vendorId: string) {
  return mockBookings.filter(b => b.vendor === vendorId);
}

export function getCartByUser(userId: string) {
  return mockCarts[userId] || { items: [] };
}
