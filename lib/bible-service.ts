/**
 * Bible API service for fetching Bible verses and passages
 * This implementation uses the ESV API (https://api.esv.org/)
 * You'll need to register for an API key at https://api.esv.org/account/create/
 */

// Fallback verses for when API is unavailable
const FALLBACK_VERSES: Record<string, string> = {
  'John 3:16': 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
  'Romans 8:28': 'And we know that for those who love God all things work together for good, for those who are called according to his purpose.',
  'Psalm 23:1': 'The LORD is my shepherd; I shall not want.',
  'Philippians 4:13': 'I can do all things through him who strengthens me.',
  'Jeremiah 29:11': 'For I know the plans I have for you, declares the LORD, plans for welfare and not for evil, to give you a future and a hope.',
  'Proverbs 3:5-6': 'Trust in the LORD with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.',
  'Matthew 6:33': 'But seek first the kingdom of God and his righteousness, and all these things will be added to you.',
  '1 Corinthians 13:4': 'Love is patient and kind; love does not envy or boast; it is not arrogant',
};

/**
 * Get Bible verse text
 * @param reference Bible reference (e.g. "John 3:16", "Romans 8:28-30")
 * @returns Object with verse text and metadata
 */
export async function getBibleVerse(reference: string): Promise<{
  text: string;
  reference: string;
  translation: string;
}> {
  try {
    // Check if we have environment variable for API key
    const esvApiKey = process.env.ESV_API_KEY;
    
    if (!esvApiKey) {
      // Use fallback if no API key
      return getFallbackVerse(reference);
    }
    
    // Clean the reference to ensure it's properly formatted for the API
    const cleanReference = reference.replace(/\s+/g, '+');
    
    // Make request to ESV API
    const response = await fetch(`https://api.esv.org/v3/passage/text/?q=${encodeURIComponent(cleanReference)}&include-passage-references=false&include-verse-numbers=false&include-footnotes=false`, {
      headers: {
        'Authorization': `Token ${esvApiKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`ESV API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.passages && data.passages.length > 0) {
      return {
        text: data.passages[0].trim(),
        reference: data.query,
        translation: 'ESV'
      };
    }
    
    // Fallback if passage not found
    return getFallbackVerse(reference);
  } catch (error) {
    console.error('Error fetching Bible verse:', error);
    // Fallback to static verses if API fails
    return getFallbackVerse(reference);
  }
}

/**
 * Get a fallback verse when API is unavailable
 */
function getFallbackVerse(reference: string): {
  text: string;
  reference: string;
  translation: string;
} {
  // Normalize the reference
  const normalizedRef = reference.replace(/\s+/g, ' ').trim();
  
  // Return from fallback list or a placeholder
  const text = FALLBACK_VERSES[normalizedRef] || `[Text of ${reference} would appear here]`;
  
  return {
    text,
    reference: normalizedRef,
    translation: 'ESV'
  };
}

/**
 * Search the Bible for keywords or phrases
 * Returns verses that contain the search terms
 * @param query Search query
 * @returns Array of matching verses
 */
export async function searchBible(query: string): Promise<Array<{
  reference: string;
  text: string;
  translation: string;
}>> {
  try {
    // Check if we have environment variable for API key
    const esvApiKey = process.env.ESV_API_KEY;
    
    if (!esvApiKey) {
      // Return empty results if no API key
      return [];
    }
    
    // Make request to ESV API for search
    const response = await fetch(`https://api.esv.org/v3/passage/search/?q=${encodeURIComponent(query)}&page-size=10`, {
      headers: {
        'Authorization': `Token ${esvApiKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`ESV API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      // Map results to our format
      return data.results.map((result: { reference: string; content: string }) => ({
        reference: result.reference,
        text: result.content,
        translation: 'ESV'
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error searching Bible:', error);
    return [];
  }
}