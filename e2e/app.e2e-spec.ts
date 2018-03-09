import { Webmonitor2Page } from './app.po';

describe('webmonitor2 App', () => {
  let page: Webmonitor2Page;

  beforeEach(() => {
    page = new Webmonitor2Page();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
