import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

// GET /api/tasks/[id] - Bitta taskni olish
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const taskId = Number(id);
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(task);
}

// PUT /api/tasks/[id] - Taskni yangilash
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const taskId = Number(id);
  const body = await req.json();
  
  // Title, completed va priority ni yangilash
  const updateData: { title?: string; completed?: boolean; priority?: string } = {};
  if (body.hasOwnProperty('title')) updateData.title = body.title;
  if (body.hasOwnProperty('completed')) updateData.completed = body.completed;
  if (body.hasOwnProperty('priority')) updateData.priority = body.priority;
  
  const task = await prisma.task.update({ where: { id: taskId }, data: updateData });
  return NextResponse.json(task);
}

// DELETE /api/tasks/[id] - Taskni o'chirish
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const taskId = Number(id);
  await prisma.task.delete({ where: { id: taskId } });
  return NextResponse.json({ success: true });
}
