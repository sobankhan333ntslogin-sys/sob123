import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

const sampleProducts = [
  {
    name: 'Wireless Bluetooth Headphones',
    slug: 'wireless-bluetooth-headphones',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    price: 89.99,
    brand: 'AudioTech',
    rating: 4.5,
    numReviews: 12,
    countInStock: 10,
    description: 'High-quality wireless headphones with noise cancellation.',
  },
  {
    name: 'Minimalist Wrist Watch',
    slug: 'minimalist-wrist-watch',
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
    price: 129.50,
    brand: 'TimePiece',
    rating: 4.0,
    numReviews: 8,
    countInStock: 5,
    description: 'Elegant and simple watch for everyday use.',
  },
  {
    name: 'Ergonomic Office Chair',
    slug: 'ergonomic-office-chair',
    category: 'Furniture',
    image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&q=80',
    price: 249.99,
    brand: 'ComfortSet',
    rating: 4.8,
    numReviews: 24,
    countInStock: 20,
    description: 'Adjustable ergonomic chair for long working hours.',
  },
  {
    name: 'Smartphone 4K Camera',
    slug: 'smartphone-4k-camera',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80',
    price: 599.00,
    brand: 'TechPro',
    rating: 4.7,
    numReviews: 45,
    countInStock: 15,
    description: 'Latest model with ultra high definition camera.',
  },
  {
    name: 'Running Shoes X1',
    slug: 'running-shoes-x1',
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
    price: 115.00,
    brand: 'Sprint',
    rating: 4.2,
    numReviews: 32,
    countInStock: 8,
    description: 'Lightweight and durable running shoes.',
  },
  {
    name: 'Coffee Maker Premium',
    slug: 'coffee-maker-premium',
    category: 'Appliances',
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&q=80',
    price: 85.00,
    brand: 'BrewMaster',
    rating: 4.6,
    numReviews: 18,
    countInStock: 12,
    description: 'Start your morning with the perfect cup of coffee.',
  }
];

export async function GET() {
  try {
    await dbConnect();
    
    // Seed database if empty
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(sampleProducts);
    }

    const products = await Product.find({}).sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (error: any) {
    console.warn('Database connection failed, falling back to dummy data.', error.message);
    
    // Fallback to sample data with fake IDs so the frontend still works for demonstration
    const fallbackProducts = sampleProducts.map((p, i) => ({
      ...p,
      _id: `fallback_id_${i}`,
      createdAt: new Date().toISOString()
    }));
    
    return NextResponse.json(fallbackProducts);
  }
}
