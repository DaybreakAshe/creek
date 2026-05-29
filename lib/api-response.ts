import { NextResponse } from 'next/server'

export function apiError(code: string, status: number) {
  return NextResponse.json({ error: code }, { status })
}
