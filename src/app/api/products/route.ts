import { NextResponse } from 'next/server';

const mockProducts = [
  {
    id: 1,
    name: "Arabica Coffee Beans",
    origin: "Ethiopia",
    grade: "Grade 1",
    price_1kg: 15.99,
    price_100kg: 1399.00,
    price_20ft: 25000.00,
    price_40ft: 45000.00,
    stock_quantity: 5000,
    harvested_date: "2023-10-15"
  },
  {
    id: 2,
    name: "Robusta Coffee Beans",
    origin: "Vietnam",
    grade: "Grade A",
    price_1kg: 12.99,
    price_100kg: 1099.00,
    price_20ft: 20000.00,
    price_40ft: 38000.00,
    stock_quantity: 8000,
    harvested_date: "2023-09-20"
  },
  {
    id: 3,
    name: "Colombian Coffee Beans",
    origin: "Colombia",
    grade: "Premium",
    price_1kg: 17.99,
    price_100kg: 1599.00,
    price_20ft: 28000.00,
    price_40ft: 48000.00,
    stock_quantity: 3500,
    harvested_date: "2023-11-01"
  }
];

export async function GET() {
  try {
    return NextResponse.json(mockProducts);
  } catch (error) {
    console.error('Error in products API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
