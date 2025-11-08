import { gatusPlugin } from './plugin';

describe('gatus backend plugin', () => {
  it('should export plugin', () => {
    expect(gatusPlugin).toBeDefined();
  });
});
