export function buildSystemPrompt(profile) {
  const boostedTopics = Object.entries(profile.signalRatings || {})
    .filter(([, score]) => score > 5)
    .map(([topic]) => topic);

  const boostNote =
    boostedTopics.length > 0
      ? `\n\nHIGH-PRIORITY TOPICS (reader has consistently rated these highly — provide extra depth):\n${boostedTopics.map((t) => `- ${t}`).join('\n')}`
      : '';

  return `You are a personal intelligence analyst writing an exclusive briefing for one specific person.

READER PROFILE:
- Name: ${profile.name || 'Reader'}
- Role: ${profile.role || 'Professional'}
- Location: ${profile.location || 'Not specified'}
- Personal context: ${profile.lifeContext || 'Not provided'}

WRITING RULES:
- Always end each topic section with: "Why this matters to you: [1 sentence specific to their role/location/context]"
- Tone: ${profile.preferredTone || 'analytical'}
- Depth: ${profile.preferredDepth || 'standard'} (quick = 2 bullets/topic, standard = 2 paragraphs, deep = 4+ paragraphs with analysis)
- Never write for a general audience. Write as if you know this person.
- Use real data points, named actors, concrete implications
- No filler, no fluff, no marketing language
- Format each topic as a section with a ## heading
- Use markdown formatting
- Today's date: ${new Date().toDateString()}${boostNote}`;
}

export function buildBriefingPrompt(topics, tone, depth) {
  const topicList = topics.map((t) => `- ${t}`).join('\n');

  return `Generate my personal intelligence briefing for today.

TOPICS TO COVER:
${topicList}

TONE: ${tone}
DEPTH: ${depth}

For each topic, provide:
1. The most significant development or trend right now
2. Key data points or named actors involved
3. A "Why this matters to you" closing line personalized to my profile

Start with a one-line briefing summary, then cover each topic as its own section.`;
}

export function buildGmailDigestPrompt(newsletters) {
  const summaries = newsletters
    .map((n) => `FROM: ${n.from}\nSUBJECT: ${n.subject}\nBODY:\n${n.body.slice(0, 1500)}`)
    .join('\n\n---\n\n');

  return `Distill the following email newsletters into a structured intelligence digest.

For each newsletter:
1. Source name and subject
2. TL;DR (1-2 sentences)
3. Key points (bullet list)
4. Any action items or deadlines mentioned

Then provide an overall summary at the top.

NEWSLETTERS:
${summaries}`;
}

export function addSearchContext(userPrompt, providerSupportsSearch) {
  if (providerSupportsSearch) return userPrompt;
  return `${userPrompt}

NOTE: You do not have live web access. Use your training knowledge to the best of your ability.
- State the date of your knowledge cutoff if relevant
- Clearly label any information that may be outdated with "[as of training data]"
- Focus on structural analysis and patterns rather than breaking news
- Today's date for context: ${new Date().toDateString()}`;
}
