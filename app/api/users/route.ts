import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'app/api/users/users.json');

async function readUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeUsers(users: any[]) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

export async function GET() {
  const users = await readUsers();
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  if (!data.email || !data.name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const users = await readUsers();
  const user = { id: Date.now(), ...data, acceptedHackathons: [], university: null };
  users.push(user);
  await writeUsers(users);
  return NextResponse.json(user, { status: 201 });
}

// PATCH: Update user's accepted hackathons or university
export async function PATCH(req: NextRequest) {
  const { userId, hackathonId, university } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  const users = await readUsers();
  const user = users.find((u: any) => u.id === userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  if (hackathonId) {
    if (!user.acceptedHackathons.includes(hackathonId)) {
      user.acceptedHackathons.push(hackathonId);
    }
  }
  if (university !== undefined) {
    user.university = university;
  }
  await writeUsers(users);
  return NextResponse.json(user);
} 