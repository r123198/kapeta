import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    { error: 'User seeding is disabled for security.' },
    { status: 403 }
  )
}
