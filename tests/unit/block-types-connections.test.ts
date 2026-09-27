// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import '@/blocks/post-quantum/basic/encoding';

describe('Blockly cryptographic type connections', () => {
  let workspace: Blockly.Workspace;

  beforeEach(() => {
    workspace = new Blockly.Workspace();
  });

  afterEach(() => {
    workspace.dispose();
  });

  function canConnect(outputType: string, inputType: string): boolean {
    const outputBlock = workspace.newBlock(outputType);
    const inputBlock = workspace.newBlock(inputType);
    return workspace.connectionChecker.canConnect(
      outputBlock.outputConnection,
      inputBlock.getInput('INPUT')?.connection ?? null,
      false,
    );
  }

  it('rejects Bits and IntList connections in either direction', () => {
    expect(canConnect('pq_bytes_to_bits', 'pq_byte_encode')).toBe(false);
    expect(canConnect('pq_byte_decode', 'pq_bits_to_bytes')).toBe(false);
  });

  it('allows connections when the declared types match', () => {
    expect(canConnect('pq_bytes_to_bits', 'pq_bits_to_bytes')).toBe(true);
    expect(canConnect('pq_byte_decode', 'pq_byte_encode')).toBe(true);
  });
});
