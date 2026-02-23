import { describe, it, expect } from 'vitest';
import { parseDurationToMs, formatDuration } from '../durationParser';

describe('parseDurationToMs', () => {
  it('parses "10 minutes" to 600000ms', () => {
    expect(parseDurationToMs('10 minutes')).toBe(600000);
  });

  it('parses "1 hour" to 3600000ms', () => {
    expect(parseDurationToMs('1 hour')).toBe(3600000);
  });

  it('parses "8 hours" to 28800000ms', () => {
    expect(parseDurationToMs('8 hours')).toBe(28800000);
  });

  it('parses "1 minute" to 60000ms', () => {
    expect(parseDurationToMs('1 minute')).toBe(60000);
  });

  it('returns null for "Triggered"', () => {
    expect(parseDurationToMs('Triggered')).toBeNull();
  });

  it('returns null for "While Selected"', () => {
    expect(parseDurationToMs('While Selected')).toBeNull();
  });

  it('returns null for "Permanent"', () => {
    expect(parseDurationToMs('Permanent')).toBeNull();
  });

  it('returns null for "Special"', () => {
    expect(parseDurationToMs('Special')).toBeNull();
  });

  it('returns null for "Instant"', () => {
    expect(parseDurationToMs('Instant')).toBeNull();
  });

  it('returns null for unrecognized strings', () => {
    expect(parseDurationToMs('forever')).toBeNull();
  });
});

describe('formatDuration', () => {
  it('formats "triggered" as "Until triggered"', () => {
    expect(formatDuration('triggered')).toBe('Until triggered');
  });

  it('formats "while selected" as "While selected"', () => {
    expect(formatDuration('while selected')).toBe('While selected');
  });

  it('passes through other strings unchanged', () => {
    expect(formatDuration('10 minutes')).toBe('10 minutes');
  });
});
