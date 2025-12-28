import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test 1: Check if file exists
    const fs = require('fs');
    const path = require('path');
    
    const dataPath = path.join(process.cwd(), 'data', 'villas-vercel-blob.json');
    const srcDataPath = path.join(process.cwd(), 'src', 'data', 'villas-vercel-blob.json');
    
    const checks = {
      dataExists: fs.existsSync(dataPath),
      srcDataExists: fs.existsSync(srcDataPath),
      cwd: process.cwd(),
      nodeVersion: process.version
    };

    // Test 2: Try to load JSON
    let jsonData = null;
    let error = null;
    try {
      const villasModule = await import('../../../../../../data/villas-vercel-blob.json');
      jsonData = { 
        loaded: true, 
        count: villasModule.default?.length || 0,
        firstVilla: villasModule.default?.[0]?.name || 'unknown'
      };
    } catch (e: any) {
      error = e.message;
    }

    return NextResponse.json({
      status: 'ok',
      checks,
      jsonData,
      error
    });
  } catch (e: any) {
    return NextResponse.json({
      status: 'error',
      message: e.message,
      stack: e.stack
    }, { status: 500 });
  }
}
