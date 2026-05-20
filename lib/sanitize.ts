const allowedTags = new Set(["section", "h3", "p", "ul", "li", "strong", "em", "div"]);

export function sanitizeHtmlFragment(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/\s(?:style|class|id|href|src)="[^"]*"/gi, "")
    .replace(/\s(?:style|class|id|href|src)='[^']*'/gi, "")
    .replace(/<\/?([a-zA-Z0-9-]+)(?:\s[^>]*)?>/g, (match, tagName: string) => {
      const normalized = tagName.toLowerCase();
      if (!allowedTags.has(normalized)) return "";
      return match.startsWith("</") ? `</${normalized}>` : `<${normalized}>`;
    });
}
