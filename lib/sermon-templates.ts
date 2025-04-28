/**
 * Sermon templates for different occasions and purposes
 */

export interface SermonTemplate {
  id: string;
  name: string;
  description: string;
  structure: string[];
  example?: string;
  occasion: 'sunday' | 'special' | 'funeral' | 'wedding' | 'youth' | 'evangelistic';
}

/**
 * Collection of sermon templates for different occasions
 */
export const sermonTemplates: SermonTemplate[] = [
  {
    id: 'expository',
    name: 'Expository',
    description: 'Explains and applies a passage of scripture, verse by verse',
    occasion: 'sunday',
    structure: [
      '# Introduction',
      '- Hook: Engage the audience with a relevant illustration or question',
      '- Context: Explain the historical and literary context of the passage',
      '- Main Idea: State the central theme or message of the passage',
      '',
      '# Exposition',
      '- Point 1: First key insight from the passage',
      '  - Explanation: What the text means',
      '  - Illustration: Story or example that reinforces the point',
      '  - Application: How to implement this in daily life',
      '- Point 2: Second key insight from the passage',
      '  - Explanation: What the text means',
      '  - Illustration: Story or example that reinforces the point',
      '  - Application: How to implement this in daily life',
      '- Point 3: Third key insight from the passage',
      '  - Explanation: What the text means',
      '  - Illustration: Story or example that reinforces the point',
      '  - Application: How to implement this in daily life',
      '',
      '# Conclusion',
      '- Restate main idea',
      '- Final challenge or invitation',
      '- Closing prayer'
    ]
  },
  {
    id: 'topical',
    name: 'Topical',
    description: 'Addresses a specific topic or theme using multiple scripture passages',
    occasion: 'sunday',
    structure: [
      '# Introduction',
      '- Hook: Engage with current event or common experience',
      '- Relevance: Why this topic matters today',
      '- Thesis: State the main argument or position',
      '',
      '# Main Points',
      '- Point 1: First aspect of the topic',
      '  - Scripture 1: Biblical support',
      '  - Explanation: Meaning and context',
      '  - Application: Practical implications',
      '- Point 2: Second aspect of the topic',
      '  - Scripture 2: Biblical support',
      '  - Explanation: Meaning and context',
      '  - Application: Practical implications',
      '- Point 3: Third aspect of the topic',
      '  - Scripture 3: Biblical support',
      '  - Explanation: Meaning and context',
      '  - Application: Practical implications',
      '',
      '# Conclusion',
      '- Summary of main points',
      '- Call to action',
      '- Final thought or illustration'
    ]
  },
  {
    id: 'narrative',
    name: 'Narrative',
    description: 'Tells a Bible story with applications for today',
    occasion: 'sunday',
    structure: [
      '# Introduction',
      '- Hook: Contemporary situation that parallels the biblical story',
      '- Bridge: Connection between our situation and the biblical narrative',
      '- Preview: Brief overview of the story and its significance',
      '',
      '# The Story',
      '- Setting: Historical and cultural context',
      '- Characters: Introduction to key figures',
      '- Conflict: The central problem or tension',
      '- Plot Development: Key events in sequence',
      '- Climax: The turning point or resolution',
      '- Resolution: How the story ends',
      '',
      '# Life Applications',
      '- Truth 1: Key principle from the story',
      '  - Application: How this applies today',
      '- Truth 2: Second key principle',
      '  - Application: How this applies today',
      '- Truth 3: Third key principle',
      '  - Application: How this applies today',
      '',
      '# Conclusion',
      '- Recap the story',
      '- Challenge based on the narrative',
      '- Invitation to respond'
    ]
  },
  {
    id: 'funeral',
    name: 'Funeral/Memorial',
    description: 'Comforting message for a funeral or memorial service',
    occasion: 'funeral',
    structure: [
      '# Introduction',
      '- Words of welcome and comfort',
      '- Acknowledgment of grief and loss',
      '- Brief prayer for God\'s presence',
      '',
      '# Remembrance',
      '- Personal reflections on the deceased',
      '- Stories that celebrate their life and faith',
      '- Special qualities and impact they had on others',
      '',
      '# Biblical Message of Hope',
      '- Scripture of comfort (e.g., Psalm 23, John 14:1-6)',
      '- God\'s promises about death and eternal life',
      '- The Christian hope of resurrection',
      '- Assurance of God\'s presence in grief',
      '',
      '# Gospel Message',
      '- Brief, sensitive presentation of the gospel',
      '- Connection to the deceased\'s faith (if applicable)',
      '- Invitation to find hope in Christ',
      '',
      '# Closing',
      '- Words of comfort for the family',
      '- Encouragement for the days ahead',
      '- Final prayer'
    ]
  },
  {
    id: 'wedding',
    name: 'Wedding',
    description: 'Message for a Christian wedding ceremony',
    occasion: 'wedding',
    structure: [
      '# Introduction',
      '- Welcome to guests',
      '- Significance of marriage as God\'s design',
      '- Recognition of the journey that brought the couple together',
      '',
      '# Biblical Foundation for Marriage',
      '- God\'s purpose for marriage (Genesis 2:24)',
      '- Marriage as a picture of Christ and the Church (Ephesians 5)',
      '- Qualities of love (1 Corinthians 13)',
      '',
      '# Message to the Couple',
      '- Encouragement for the journey ahead',
      '- Keys to a Christ-centered marriage',
      '  - Communication',
      '  - Commitment',
      '  - Forgiveness',
      '  - Growing together spiritually',
      '',
      '# Charge to the Couple',
      '- Exhortation to honor their vows',
      '- Reminder of God\'s presence in their marriage',
      '- Prayer for their life together'
    ]
  },
  {
    id: 'youth',
    name: 'Youth-Focused',
    description: 'Engaging message designed for teenagers and young adults',
    occasion: 'youth',
    structure: [
      '# Attention-Grabber',
      '- Interactive element, question, or relevant current event',
      '- Connection to teen/young adult experience',
      '- Why this matters to their life right now',
      '',
      '# Biblical Truth',
      '- Scripture passage in contemporary language',
      '- Explanation that respects their intelligence but clarifies unfamiliar concepts',
      '- How this truth challenges cultural messages they hear daily',
      '',
      '# Relatable Illustrations',
      '- Stories from youth culture or teen experience',
      '- Personal testimony that connects to their challenges',
      '- Multi-media references if appropriate (movies, songs, social media)',
      '',
      '# Practical Applications',
      '- Specific, actionable steps to take',
      '- How to live this out at school, home, with friends',
      '- Addressing real obstacles they might face',
      '',
      '# Response Opportunity',
      '- Clear invitation to respond',
      '- Next steps for growth',
      '- Prayer that speaks their language'
    ]
  },
  {
    id: 'evangelistic',
    name: 'Evangelistic',
    description: 'Presenting the gospel to non-believers or seekers',
    occasion: 'evangelistic',
    structure: [
      '# Common Ground',
      '- Acknowledge universal human experiences or questions',
      '- Bridge between secular perspective and Christian worldview',
      '- Establish credibility and openness to dialogue',
      '',
      '# The Problem',
      '- Human condition and brokenness we all experience',
      '- Limitations of common solutions',
      '- Deeper questions about purpose and meaning',
      '',
      '# The Gospel Solution',
      '- God\'s love and initiative (John 3:16)',
      '- Christ\'s life, death and resurrection',
      '- The offer of forgiveness and new life',
      '- Explain key concepts with minimal jargon',
      '',
      '# Addressing Objections',
      '- Respectfully acknowledge common questions',
      '- Brief, thoughtful responses',
      '- Invitation to further conversation',
      '',
      '# Invitation and Next Steps',
      '- Clear explanation of how to respond to Christ',
      '- Practical immediate next steps',
      '- Prayer of commitment with explanation'
    ]
  }
];

/**
 * Get all sermon templates
 */
export function getAllSermonTemplates(): SermonTemplate[] {
  return sermonTemplates;
}

/**
 * Get sermon templates by occasion
 */
export function getSermonTemplatesByOccasion(occasion: string): SermonTemplate[] {
  return sermonTemplates.filter(template => template.occasion === occasion);
}

/**
 * Get a specific sermon template by ID
 */
export function getSermonTemplateById(id: string): SermonTemplate | undefined {
  return sermonTemplates.find(template => template.id === id);
}