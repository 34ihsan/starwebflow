import { NextResponse } from 'next/server';
import { NICHE_SECTOR_BLUEPRINTS, COUNTRY_GEO_REGISTRY } from '@/lib/leads/niche-blueprints';

export async function GET() {
  return NextResponse.json({
    success: true,
    totalBlueprints: NICHE_SECTOR_BLUEPRINTS.length,
    countries: COUNTRY_GEO_REGISTRY,
    blueprints: NICHE_SECTOR_BLUEPRINTS
  });
}
