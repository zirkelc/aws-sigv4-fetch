import 'cross-fetch/polyfill';
import { getHeaders } from '../get-headers';

describe('getHeaders', () => {
  it('should return an empty Map if no arguments are provided', () => {
    const headers = getHeaders();
    expect(headers instanceof Map).toBe(true);
    expect(headers.size).toBe(0);
  });

  it('should populate headers from array of tuples', () => {
    const headers = getHeaders([
      ['header1', 'value1'],
      ['header2', 'value2'],
    ]);
    expect(headers instanceof Map).toBe(true);
    expect(headers.get('header1')).toBe('value1');
    expect(headers.get('header2')).toBe('value2');
  });

  it('should populate headers from Record object', () => {
    const headers = getHeaders({ header1: 'value1', header2: 'value2' });
    expect(headers instanceof Map).toBe(true);
    expect(headers.get('header1')).toBe('value1');
    expect(headers.get('header2')).toBe('value2');
  });

  it('should populate headers from Headers object', () => {
    const headers = getHeaders(new Headers({ header1: 'value1', header2: 'value2' }));
    expect(headers instanceof Map).toBe(true);
    expect(headers.get('header1')).toBe('value1');
    expect(headers.get('header2')).toBe('value2');
  });

  it('should throw error for non object/array/map-like inputs', () => {
    // rome-ignore lint: any is required to test invalid inputs
    expect(() => getHeaders(123 as any)).toThrowError();
    // rome-ignore lint: any is required to test invalid inputs
    expect(() => getHeaders('Invalid' as any)).toThrowError();
    // rome-ignore lint: any is required to test invalid inputs
    expect(() => getHeaders(true as any)).toThrowError();
  });
});
