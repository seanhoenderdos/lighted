import { NextRequest, NextResponse } from 'next/server';
import { getAllSermonTemplates, getSermonTemplateById, getSermonTemplatesByOccasion } from '@/lib/sermon-templates';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');
    const occasion = searchParams.get('occasion');
    
    if (id) {
      // Get a specific template by ID
      const template = getSermonTemplateById(id);
      
      if (!template) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
      
      return NextResponse.json(template);
    } else if (occasion) {
      // Get templates by occasion
      const templates = getSermonTemplatesByOccasion(occasion);
      return NextResponse.json({ templates });
    } else {
      // Get all templates
      const templates = getAllSermonTemplates();
      return NextResponse.json({ templates });
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}