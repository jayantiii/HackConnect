import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const HACKATHONS_FILE = path.join(process.cwd(), 'app/api/hackathons/hackathons.json');

async function readHackathons() {
  try {
    const data = await fs.readFile(HACKATHONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeHackathons(hackathons: any[]) {
  await fs.writeFile(HACKATHONS_FILE, JSON.stringify(hackathons, null, 2));
}

export async function GET() {
  const hackathons = await readHackathons();
  return NextResponse.json(hackathons);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  if (!data.name || !data.date || !data.location || !data.info || !data.website || !data.creatorEmail) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const hackathons = await readHackathons();
  const hackathon = { id: Date.now(), ...data, registeredStudents: [] };
  hackathons.push(hackathon);
  await writeHackathons(hackathons);
  return NextResponse.json(hackathon, { status: 201 });
}

// PATCH: Register a student to a hackathon
export async function PATCH(req: NextRequest) {
  const { hackathonId, registrationData } = await req.json();
  if (!hackathonId || !registrationData.userId) {
    return NextResponse.json({ error: 'Missing hackathonId or userId' }, { status: 400 });
  }
  const hackathons = await readHackathons();
  const hackathon = hackathons.find((h: any) => h.id === hackathonId);
  if (!hackathon) {
    return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
  }
  if (hackathon.registeredStudents.some((s: any) => s.userId === registrationData.userId)) {
    return NextResponse.json({ error: 'Already registered' }, { status: 400 });
  }
  hackathon.registeredStudents.push(registrationData);
  await writeHackathons(hackathons);
  return NextResponse.json(hackathon);
}

// DELETE: Only creator can delete their hackathon
export async function DELETE(req: NextRequest) {
  const { hackathonId, email } = await req.json();
  if (!hackathonId || !email) {
    return NextResponse.json({ error: 'Missing hackathonId or email' }, { status: 400 });
  }
  let hackathons = await readHackathons();
  const hackathon = hackathons.find((h: any) => h.id === hackathonId);
  if (!hackathon) {
    return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
  }
  if (hackathon.creatorEmail !== email) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  hackathons = hackathons.filter((h: any) => h.id !== hackathonId);
  await writeHackathons(hackathons);
  return NextResponse.json({ success: true });
} 