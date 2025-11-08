import { uptimePlugin } from './plugin';

describe('uptime', () => {
  it('should export plugin', () => {
    expect(uptimePlugin).toBeDefined();
  });
});
