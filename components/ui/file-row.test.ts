import { describe, expect, it } from 'vitest';
import { downloadName } from './file-row';

describe('downloadName', () => {
  it('names the download after the label, keeping the extension', () => {
    expect(downloadName('Loops — slides', '/files/sessions/4/files/0/file.pdf')).toBe('loops-slides.pdf');
    expect(downloadName('Starter files', '/files/sprints/x/files/0/file.zip')).toBe('starter-files.zip');
  });
  it('falls back to "file" for labels without letters or digits', () => {
    expect(downloadName('—', '/f/file.png')).toBe('file.png');
    expect(downloadName('Notes', '/f/README')).toBe('notes');
  });
});
