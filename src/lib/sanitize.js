import DOMPurify from 'dompurify';

export function safeHtml(dirty) {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'strong', 'em', 'h2', 'h3', 'ul', 'li', 'ol',
      'blockquote', 'br', 'a', 'code', 'pre', 'hr', 'span',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    FORCE_BODY: true,
  });
}

// Add target="_blank" and rel="noopener noreferrer" to all links
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});
