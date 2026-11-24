const INTERNAL_INSTRUCTION = /^\s*(?:kategorikan|cari(?:lah)?|hitung(?:lah)?|hasilkan|dijual|kikis)\b/i;
const INTERNAL_LABEL = /^\s*(?:instruksi|catatan internal|label internal|placeholder|internal)\b/i;

export type OutputFilterResult = {
  text: string;
  invalid: boolean;
};

function containsInternalAnnotation(text: string): boolean {
  if (text.includes("{{")) return true;
  const bracketContents = [...text.matchAll(/\[([^\[\]]*)\]/g)].map(
    (match) => match[1],
  );
  const hasOpenInstruction = /\[\s*(?:kategorikan|cari(?:lah)?|hitung(?:lah)?|hasilkan|dijual|kikis)\b/i.test(
    text,
  );

  return (
    hasOpenInstruction ||
    bracketContents.some(
      (content) => INTERNAL_INSTRUCTION.test(content) || INTERNAL_LABEL.test(content),
    )
  );
}

export class AssistantOutputFilter {
  private pendingBracketRun = "";
  private bracketDepth = 0;
  private pendingOpeningBrace = false;
  private placeholderBuffer = "";

  push(chunk: string): OutputFilterResult {
    let text = "";

    for (const character of chunk) {
      if (this.placeholderBuffer) {
        this.placeholderBuffer += character;
        if (this.placeholderBuffer.endsWith("}}")) {
          this.placeholderBuffer = "";
          return { text, invalid: true };
        }
        continue;
      }

      if (this.bracketDepth > 0) {
        this.pendingBracketRun += character;
        if (character === "[") this.bracketDepth += 1;
        if (character === "]") this.bracketDepth -= 1;
        continue;
      }

      if (this.pendingOpeningBrace) {
        this.pendingOpeningBrace = false;
        if (character === "{") {
          this.placeholderBuffer = "{{";
          continue;
        }
        text += "{";
      }

      if (this.pendingBracketRun) {
        if (/\s/.test(character)) {
          this.pendingBracketRun += character;
          continue;
        }
        if (character === "[") {
          this.pendingBracketRun += character;
          this.bracketDepth = 1;
          continue;
        }
        if (containsInternalAnnotation(this.pendingBracketRun)) {
          this.pendingBracketRun = "";
          return { text, invalid: true };
        }
        text += this.pendingBracketRun;
        this.pendingBracketRun = "";
      }

      if (character === "[") {
        this.pendingBracketRun = character;
        this.bracketDepth = 1;
      } else if (character === "{") {
        this.pendingOpeningBrace = true;
      } else {
        text += character;
      }
    }

    return { text, invalid: false };
  }

  finish(): OutputFilterResult {
    if (this.placeholderBuffer) {
      this.placeholderBuffer = "";
      return { text: "", invalid: true };
    }

    if (containsInternalAnnotation(this.pendingBracketRun)) {
      this.pendingBracketRun = "";
      this.bracketDepth = 0;
      return { text: "", invalid: true };
    }

    const text =
      this.pendingBracketRun + (this.pendingOpeningBrace ? "{" : "");
    this.pendingBracketRun = "";
    this.bracketDepth = 0;
    this.pendingOpeningBrace = false;
    return { text, invalid: false };
  }
}
