/**
 * Content Moderation Service
 * Checks user prompts for inappropriate content before AI generation
 */

const logger = require("../../Connection/logger");

// Categories of inappropriate content to block
// Using word boundaries \b to avoid false positives
const INAPPROPRIATE_CATEGORIES = {
  SEXUAL: {
    name: "Sexual Content",
    patterns: [
      /\b(naked|nude|nsfw|erotic|porn)\b/i, 
      /\b(adult\s*content|sexual\s*act|explicit\s*content)\b/i,
      /\b(breasts?|butt(er|ock)s?|genitals?|private\s*parts)\b/i,
      /\b(seductive|provocative|lingerie|underwear)\b/i,
      /\b(bikini|swimwear)\b/i,
      /\b(hot\s*girl|hot\s*boy)\b/i
    ]
  },
  VIOLENCE: {
    name: "Violence & Harm",
    patterns: [
      /\b(kill|murder)\b/i, 
      /\b(attack|assault)\b/i, 
      /\b(bomb|weapon|gun)\b/i,
      /\b(shoot|stab)\b/i,
      /\b(beat\s*up|hit\s*hard)\b/i,
      /\b(self\s*harm|self\s*injure)\b/i,
      /\b(rape|sexual\s*assault)\b/i,
      /\b(torture|cruel)\b/i
    ]
  },
  HATEFUL: {
    name: "Hate Speech",
    patterns: [
      /\b(hate\s*speech|hate\s*crime)\b/i, 
      /\b(racist|sexist|homophobic|transphobic)\b/i,
      /\b(discriminat(e|ion))\b/i, 
      /\b(nazi|fascist|supremac(y|ist))\b/i,
      /\b(racial\s*slur|religious\s*hatred)\b/i
    ]
  },
  ILLEGAL: {
    name: "Illegal Content",
    patterns: [
      /\b(cocaine|heroin|meth|ecstasy|mdma)\b/i,
      /\b(illegal\s*drug|prescription\s*drug|opioid)\b/i,
      /\b(hack\s*account|hack\s*into|stolen\s*data)\b/i,
      /\b(fraud|scam|phishing)\b/i,
      /\b(pirat(e|ed)\s*content|copyright\s*infringement)\b/i,
      /\b(child\s*porn|csam)\b/i
    ]
  },
  HARASSMENT: {
    name: "Harassment",
    patterns: [
      /\b(bully|cyberbully|harass|stalk)\b/i,
      /\b(threaten|intimidat(e|ion))\b/i,
      /\b(dox|doxxing|reveal\s*personal\s*info)\b/i
    ]
  },
  SELF_HARM: {
    name: "Self Harm",
    patterns: [
      /\b(self\s*harm|cut\s*yourself)\b/i,
      /\b(suicide|kill\s*yourself|end\s*your\s*life)\b/i,
      /\b(overdose)\b/i,
      /\b(eating\s*disorder|anorexia|bulimia)\b/i
    ]
  },
  MISINFORMATION: {
    name: "Misinformation",
    patterns: [
      /\b(fake\s*news|conspiracy\s*theory)\b/i,
      /\b(hoax)\b/i,
      /\b(misinform|disinform)\b/i
    ]
  },
  SPAM: {
    name: "Spam & Advertising",
    patterns: [
      /\b(buy\s*followers|buy\s*likes|buy\s*views)\b/i,
      /\b(fake\s*engagement|bot\s*account)\b/i,
      /\b(click\s*bait|fake\s*giveaway)\b/i,
      /\b(win\s*free\s*money|make\s*money\s*fast)\b/i,
      /\b(mlm|pyramid\s*scheme|crypto\s*scam)\b/i
    ]
  }
};

// Safe topics that are allowed
const SAFE_TOPICS = [
  /marketing/i, /business/i, /promotion/i, /advertisement/i,
  /product/i, /service/i, /brand/i, /company/i,
  /social\s*media/i, /content/i, /post/i, /article/i,
  /blog/i, /news/i, /update/i, /announcement/i,
  /event/i, /sale/i, /discount/i, /offer/i,
  /festival/i, /celebration/i, /holiday/i,
  /fashion/i, /style/i, /beauty/i, /makeup/i,
  /food/i, /recipe/i, /restaurant/i, /cafe/i,
  /travel/i, /tourism/i, /destination/i,
  /fitness/i, /health/i, /wellness/i, /exercise/i,
  /technology/i, /software/i, /app/i, /digital/i,
  /education/i, /learning/i, /course/i, /tutorial/i,
  /entertainment/i, /movie/i, /music/i, /game/i,
  /art/i, /design/i, /photography/i, /creative/i
];

/**
 * Check if content contains inappropriate material
 * @param {string} prompt - The user's prompt to check
 * @returns {object} - { isAllowed: boolean, category: string, message: string, matchedPatterns: array }
 */
const checkContentModeration = (prompt) => {
  if (!prompt || typeof prompt !== 'string') {
    return {
      isAllowed: false,
      category: 'INVALID',
      message: 'Prompt is required and must be a valid string.',
      matchedPatterns: []
    };
  }

  // Normalize: replace newlines with spaces, collapse multiple spaces
  const normalizedPrompt = prompt.replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ').trim();
  const trimmedPrompt = normalizedPrompt;
  
  if (trimmedPrompt.length === 0) {
    return {
      isAllowed: false,
      category: 'EMPTY',
      message: 'Prompt cannot be empty. Please provide a valid prompt.',
      matchedPatterns: []
    };
  }

  // Check minimum length (too short prompts might be accidental)
  if (trimmedPrompt.length < 3) {
    return {
      isAllowed: false,
      category: 'TOO_SHORT',
      message: 'Prompt is too short. Please provide a more descriptive prompt (at least 3 characters).',
      matchedPatterns: []
    };
  }

  // Check maximum length (prevent abuse)
  if (trimmedPrompt.length > 2000) {
    return {
      isAllowed: false,
      category: 'TOO_LONG',
      message: 'Prompt is too long. Please limit your prompt to 2000 characters or less.',
      matchedPatterns: []
    };
  }

  const matchedPatterns = [];

  // Check each inappropriate category
  for (const [categoryKey, category] of Object.entries(INAPPROPRIATE_CATEGORIES)) {
    for (const pattern of category.patterns) {
      if (pattern.test(trimmedPrompt)) {
        const match = prompt.match(pattern);
        matchedPatterns.push({
          category: category.name,
          pattern: pattern.source,
          matched: match ? match[0] : 'unknown'
        });
        // Debug log
        logger.info('Pattern matched in moderation', {
          category: category.name,
          pattern: pattern.source,
          matched: match ? match[0] : 'unknown',
          promptPreview: trimmedPrompt.substring(0, 50)
        });
      }
    }
  }

  // If any inappropriate content found, block it
  if (matchedPatterns.length > 0) {
    const categoriesFound = [...new Set(matchedPatterns.map(m => m.category))];
    
    logger.warn('Inappropriate content detected in prompt', {
      userPrompt: trimmedPrompt.substring(0, 100) + '...',
      categoriesFound,
      matchedCount: matchedPatterns.length
    });

    return {
      isAllowed: false,
      category: categoriesFound.join(', '),
      message: `Your prompt contains content that is not allowed: ${categoriesFound.join(', ')}. Please modify your prompt and try again.`,
      matchedPatterns
    };
  }

  // Check for suspicious patterns that might be attempting to bypass filters
  const suspiciousPatterns = [
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/,  // Control characters (excluding tab 0x09, newline 0x0A, carriage return 0x0D)
    /\b(viagra|cialis|levitra)\b/i,  // Spam medications
    /\b(weight\s*loss|belly\s*fat)\b/i,  // Fake medical claims
    /\b(bitcoin|btc|ethereum|eth)\s*(free|giveaway|double)\b/i,  // Crypto scams
    /\$\d+(\s*k|\s*m)?\s*(free|now|today)/i,  // Money scams
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmedPrompt)) {
      logger.warn('Suspicious pattern detected in prompt', {
        pattern: pattern.source
      });
      
      return {
        isAllowed: false,
        category: 'SUSPICIOUS',
        message: 'Your prompt contains suspicious content that could not be processed. Please modify your prompt and try again.',
        matchedPatterns: []
      };
    }
  }

  // Prompt passed all checks
  return {
    isAllowed: true,
    category: null,
    message: 'Content passed moderation check.',
    matchedPatterns: []
  };
};

/**
 * Moderate AI-generated content as well (double-check)
 * @param {string} content - The AI-generated content to check
 * @returns {object} - { isAllowed: boolean, category: string, message: string }
 */
const moderateGeneratedContent = (content) => {
  if (!content) {
    return { isAllowed: true, category: null, message: 'No content to moderate' };
  }

  const result = checkContentModeration(content);
  
  if (!result.isAllowed) {
    logger.error('AI-generated content failed moderation', {
      category: result.category,
      contentPreview: content.substring(0, 100)
    });
  }
  
  return result;
};

/**
 * Get list of allowed topics for user guidance
 * @returns {array} - List of allowed topic patterns
 */
const getAllowedTopics = () => {
  return SAFE_TOPICS.map(pattern => pattern.source);
};

/**
 * Get list of blocked categories
 * @returns {array} - List of blocked categories with descriptions
 */
const getBlockedCategories = () => {
  return Object.entries(INAPPROPRIATE_CATEGORIES).map(([key, value]) => ({
    key,
    name: value.name,
    examplePatterns: value.patterns.slice(0, 5).map(p => p.source.replace(/[\/\\]/g, ''))
  }));
};

module.exports = {
  checkContentModeration,
  moderateGeneratedContent,
  getAllowedTopics,
  getBlockedCategories,
  INAPPROPRIATE_CATEGORIES
};


