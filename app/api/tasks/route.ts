import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

// GET: Barcha tasklarni olish
export async function GET() {
  const tasks = await prisma.task.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(tasks);
}

// POST: Yangi task qo'shish
export async function POST(req: NextRequest) {
  const { title, priority } = await req.json();
  const task = await prisma.task.create({ 
    data: { 
      title, 
      priority: priority || 'medium' 
    } 
  });
  return NextResponse.json(task);
}
