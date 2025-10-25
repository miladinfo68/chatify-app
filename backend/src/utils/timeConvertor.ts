export default function timeConvertor(input: string): number {
  const regex = /^(\d+(?:\.\d+)?)(s|m|h|d)$/i;
  const match = input.trim().match(regex);

  if (!match) {
    throw new Error(`Invalid time format: ${input}`);
  }

  const value = parseFloat(match[1]);
  const unit = match[2].toLowerCase();

  const multipliers: Record<string, number> = {
    s: 1,
    m: 1 * 60,
    h: 60 * 60,
    d: 24 * 60 * 60,
  };

  let millisecond = value * multipliers[unit] * 1000;
  return millisecond;
}

//10d => 10 * 24 * 60 * 60 ---> 864000 * 1000 = milliseconds
