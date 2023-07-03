import { getFetchFn } from '../get-fetch';

describe('getFetchFn', () => {
  // Set up a global fetch mock
  const fetchMock = jest.fn();
  globalThis.fetch = fetchMock;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns custom fetch function if provided', () => {
    const customFetchFn = jest.fn();
    expect(getFetchFn(customFetchFn)).toBe(customFetchFn);
  });

  it('returns bound window.fetch if no custom fetch function is provided and window is defined', () => {
    const windowFetchMock = jest.fn();
    const spy = jest.spyOn(windowFetchMock, 'bind');
    // @ts-ignore
    global.window = { fetch: windowFetchMock };

    getFetchFn();
    expect(spy).toHaveBeenCalledWith(window);

    global.window = undefined;
  });

  it('returns bound globalThis.fetch if no custom fetch function is provided, window is not defined, and globalThis is defined', () => {
    const spy = jest.spyOn(fetchMock, 'bind');

    getFetchFn();
    expect(spy).toHaveBeenCalledWith(globalThis);
  });

  it('throws an error if no fetch implementation is found', () => {
    global.fetch = undefined;
    global.window = undefined;
    globalThis.fetch = undefined;

    expect(() => getFetchFn()).toThrow('No fetch implementation found');
  });
});
