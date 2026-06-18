declare const process: {
  argv: string[];
  exitCode?: number;
};

class CalculatorParser {
  private position = 0;

  constructor(private readonly input: string) {}

  parse(): number {
    const value = this.parseExpression();
    this.skipWhitespace();

    if (!this.isAtEnd()) {
      throw new Error(`Unexpected character '${this.peek()}'`);
    }

    return value;
  }

  private parseExpression(): number {
    let value = this.parseTerm();

    while (true) {
      this.skipWhitespace();

      if (this.match("+")) {
        value += this.parseTerm();
      } else if (this.match("-")) {
        value -= this.parseTerm();
      } else {
        return value;
      }
    }
  }

  private parseTerm(): number {
    let value = this.parseFactor();

    while (true) {
      this.skipWhitespace();

      if (this.match("*")) {
        value *= this.parseFactor();
      } else if (this.match("/")) {
        const divisor = this.parseFactor();
        if (divisor === 0) {
          throw new Error("Division by zero");
        }
        value /= divisor;
      } else {
        return value;
      }
    }
  }

  private parseFactor(): number {
    this.skipWhitespace();

    if (this.match("+")) {
      return this.parseFactor();
    }

    if (this.match("-")) {
      return -this.parseFactor();
    }

    if (this.match("(")) {
      const value = this.parseExpression();
      this.skipWhitespace();

      if (!this.match(")")) {
        throw new Error("Expected closing parenthesis");
      }

      return value;
    }

    return this.parseNumber();
  }

  private parseNumber(): number {
    this.skipWhitespace();
    const start = this.position;

    while (!this.isAtEnd() && this.isDigit(this.peek())) {
      this.position += 1;
    }

    if (!this.isAtEnd() && this.peek() === ".") {
      this.position += 1;
      while (!this.isAtEnd() && this.isDigit(this.peek())) {
        this.position += 1;
      }
    }

    if (start === this.position) {
      throw new Error("Expected number");
    }

    const rawNumber = this.input.slice(start, this.position);
    if (rawNumber === ".") {
      throw new Error("Expected number");
    }

    return Number(rawNumber);
  }

  private skipWhitespace(): void {
    while (!this.isAtEnd() && /\s/.test(this.peek())) {
      this.position += 1;
    }
  }

  private match(character: string): boolean {
    if (this.peek() !== character) {
      return false;
    }

    this.position += 1;
    return true;
  }

  private peek(): string {
    return this.input[this.position] ?? "";
  }

  private isAtEnd(): boolean {
    return this.position >= this.input.length;
  }

  private isDigit(character: string): boolean {
    return character >= "0" && character <= "9";
  }
}

function evaluate(expression: string): number {
  return new CalculatorParser(expression).parse();
}

function formatResult(value: number): string {
  if (!Number.isFinite(value)) {
    throw new Error("Result is not finite");
  }

  return Number(value.toPrecision(12)).toString();
}

function main(): void {
  const expression = process.argv.slice(2).join(" ").trim();

  if (expression.length === 0) {
    throw new Error("Expression is required");
  }

  console.log(formatResult(evaluate(expression)));
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Error: ${message}`);
  process.exitCode = 1;
}
