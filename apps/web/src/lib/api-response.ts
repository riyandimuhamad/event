import { NextResponse } from 'next/server';

export function jsonSuccess<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      data,
      error: null,
      meta: {
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

export function jsonError(
  code: string,
  message: string,
  status = 400,
  details?: Record<string, unknown>
) {
  return NextResponse.json(
    {
      data: null,
      error: {
        code,
        message,
        details: details || {},
      },
      meta: {
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}
