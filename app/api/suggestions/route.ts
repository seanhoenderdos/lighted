import { NextRequest, NextResponse } from 'next/server';
import { generatePastorSuggestions } from '@/ai/ai-instance';
import { getSeasonalSermonThemes, getLiturgicalReadings, getLiturgicalDate } from '@/lib/liturgical-calendar';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const countParam = searchParams.get('count');
    const count = countParam ? parseInt(countParam, 10) : 5;
    const _context = searchParams.get('context') || '';
    const denomination = searchParams.get('denomination') || 'non-denominational';
    const activeTab = searchParams.get('activeTab') || 'sermon';
    const includeSeasonalParam = searchParams.get('includeSeasonal');
    const includeSeasonal = includeSeasonalParam !== 'false'; // Default to true
    
    // Get AI-generated suggestions - now with denomination and activeTab
    let suggestions = await generatePastorSuggestions(denomination, activeTab as 'sermon' | 'exegesis' | 'counseling');
    
    // Add seasonal suggestions if requested
    if (includeSeasonal && activeTab === 'sermon') {
      const seasonalSuggestions = getSeasonalSermonThemes(3);
      
      // Get current liturgical date info
      const liturgicalInfo = getLiturgicalDate();
      
      // Get lectionary readings
      const readings = getLiturgicalReadings();
      
      // Add lectionary-based suggestions
      if (readings.length > 0) {
        const lectionarySuggestions = readings.map(reading => 
          `Prepare a sermon on ${reading.reference} for ${liturgicalInfo.name} with a ${denomination} perspective`
        );
        
        // Combine all suggestions
        suggestions = [
          ...suggestions.slice(0, count - 3), // Take some AI suggestions
          ...seasonalSuggestions.slice(0, 2),  // Take some seasonal suggestions
          lectionarySuggestions[0] || '' // Take one lectionary suggestion
        ].filter(Boolean); // Remove any empty strings
      } else {
        // No lectionary readings available, just use seasonal suggestions
        suggestions = [
          ...suggestions.slice(0, count - 2),
          ...seasonalSuggestions.slice(0, 2)
        ];
      }
    }
    
    // Limit to requested count
    suggestions = suggestions.slice(0, count);
    
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 });
  }
}