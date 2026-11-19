import { describe, expect, it } from 'vitest';
import {
  daysBetween,
  endOfMonth,
  formatDate,
  formatMonth,
  isInMonth,
  monthOf,
  monthsBetween,
  nextMonth,
  previousMonth,
  relativeDay,
  toIsoDate,
  weekdayOf,
} from './dates';

describe('dates', () => {
  it('toIsoDate uses local calendar parts and pads', () => {
    expect(toIsoDate(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
    expect(toIsoDate(new Date(2026, 10, 19, 0, 1))).toBe('2026-11-19');
  });

  it('monthOf / isInMonth', () => {
    expect(monthOf('2026-11-03')).toBe('2026-11');
    expect(isInMonth('2026-11-30', '2026-11')).toBe(true);
    expect(isInMonth('2026-12-01', '2026-11')).toBe(false);
    expect(isInMonth(null, '2026-11')).toBe(false);
  });

  it('next/previous month roll over the year', () => {
    expect(nextMonth('2026-12')).toBe('2027-01');
    expect(nextMonth('2026-09')).toBe('2026-10');
    expect(previousMonth('2027-01')).toBe('2026-12');
    expect(previousMonth('2026-10')).toBe('2026-09');
  });

  it('monthsBetween is inclusive and empty when reversed', () => {
    expect(monthsBetween('2026-11', '2027-02')).toEqual(['2026-11', '2026-12', '2027-01', '2027-02']);
    expect(monthsBetween('2026-11', '2026-11')).toEqual(['2026-11']);
    expect(monthsBetween('2026-12', '2026-11')).toEqual([]);
  });

  it('endOfMonth handles month lengths and leap years', () => {
    expect(endOfMonth('2026-11')).toBe('2026-11-30');
    expect(endOfMonth('2026-12')).toBe('2026-12-31');
    expect(endOfMonth('2027-02')).toBe('2027-02-28');
    expect(endOfMonth('2028-02')).toBe('2028-02-29');
  });

  it('formats months and dates without timezone drift', () => {
    expect(formatMonth('2026-11')).toBe('November 2026');
    expect(formatDate('2026-11-03')).toBe('3 Nov 2026');
    expect(formatDate('2026-11-03', 'day-month')).toBe('3 Nov');
    expect(formatDate('2026-11-03', 'long')).toBe('Tuesday 3 November 2026');
    expect(weekdayOf('2027-01-01')).toBe('Friday');
  });

  it('daysBetween and relativeDay', () => {
    expect(daysBetween('2026-11-19', '2026-11-24')).toBe(5);
    expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1);
    expect(daysBetween('2026-11-24', '2026-11-19')).toBe(-5);
    expect(relativeDay('2026-11-19', '2026-11-19')).toBe('today');
    expect(relativeDay('2026-11-20', '2026-11-19')).toBe('tomorrow');
    expect(relativeDay('2026-11-18', '2026-11-19')).toBe('yesterday');
    expect(relativeDay('2026-11-24', '2026-11-19')).toBe('in 5 days');
    expect(relativeDay('2026-11-16', '2026-11-19')).toBe('3 days ago');
  });
});
