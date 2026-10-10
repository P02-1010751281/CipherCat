import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const checker = resolve(process.cwd(), 'scripts/check-standard-inventory.mjs');

describe('standard inventory source-line anchors', () => {
  it('rejects a line range that exceeds the linked local source', () => {
    const fixture = mkdtempSync(join(tmpdir(), 'ciphercat-standard-anchor-'));
    const standards = join(fixture, 'docs/standards/fixture');
    mkdirSync(standards, { recursive: true });
    writeFileSync(join(standards, '00-Standard-Source.md'), 'one\ntwo\nthree\n');
    writeFileSync(join(standards, '01-entry.md'), [
      '## 条目元数据',
      '',
      '| 标准定位 | §1 |',
      '| 原文证据 | [原文](./00-Standard-Source.md#L2-L3) |',
      '| 原文位置 | [第 2–3 行](./00-Standard-Source.md#L2-L3) |',
    ].join('\n'));
    writeFileSync(join(standards, '01-entry.en.md'), [
      '## Entry Metadata',
      '',
      '| Standard position | §1 |',
      '| Source location | [Lines 2–4](./00-Standard-Source.md#L2-L4) |',
    ].join('\n'));

    try {
      let error: unknown;
      try {
        execFileSync(process.execPath, [checker], { cwd: fixture, stdio: ['ignore', 'pipe', 'pipe'] });
      } catch (caught) {
        error = caught;
      }
      expect(error).toBeDefined();
      const stderr = String((error as { stderr?: Buffer }).stderr);
      expect(stderr).toContain('01-entry.en.md: source line anchor L2-L4 exceeds 3 lines');

      writeFileSync(join(standards, '01-entry.md'), readFileSync(join(standards, '01-entry.md'), 'utf8')
        .replaceAll('#L2-L4', '#L2-L3'));
      writeFileSync(join(standards, '01-entry.en.md'), readFileSync(join(standards, '01-entry.en.md'), 'utf8')
        .replaceAll('#L2-L4', '#L2-L3'));
      execFileSync(process.execPath, [checker, '--write'], {
        cwd: fixture,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      expect(execFileSync(process.execPath, [checker, '--check'], {
        cwd: fixture,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      })).toContain('STANDARD_INVENTORY_CHECK_OK');
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  });
});
