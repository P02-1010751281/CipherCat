// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import '@/blocks/data/number';
import '@/blocks/hash/sha3';
import '@/generators/javascript';
import '@/generators/javascript/hash/sha3';
import '@/generators/python';
import '@/generators/python/hash/sha3';

import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

const zeroStateOutput = [
  'f1258f7940e1dde7', '84d5ccf933c0478a', 'd598261ea65aa9ee', 'bd1547306f80494d', '8b284e056253d057',
  'ff97a42d7f8e6fd4', '90fee5a0a44647c4', '8c5bda0cd6192e76', 'ad30a6f71b19059c', '30935ab7d08ffc64',
  'eb5aa93f2317d635', 'a9a6e6260d712103', '81a57c16dbcf555f', '43b831cd0347c826', '01f22f1a11a5569f',
  '05e5635a21d9ae61', '64befef28cc970f2', '613670957bc46611', 'b87c5a554fd00ecb', '8c3ee88a1ccf32c8',
  '940c7922ae3a2614', '1841f924a2c509e4', '16f53526e70465c2', '75f644e97f30a13b', 'eaf1ff7b5ceca249',
];

const reducedWidthVectors = [
  // Final lanes from the XKCP zero-state vector: https://github.com/XKCP/XKCP/blob/master/tests/TestVectors/KeccakF-200-IntermediateValues.txt
  {
    width: 200,
    laneBits: 8,
    expected: '3c 28 26 84 1c b3 5c 17 1e aa e9 b8 11 13 4c ea a3 85 2c 69 d2 c5 ab af ea'.split(' '),
  },
  // Final lanes from the XKCP zero-state vector: https://github.com/XKCP/XKCP/blob/master/tests/TestVectors/KeccakF-400-IntermediateValues.txt
  {
    width: 400,
    laneBits: 16,
    expected: '09f5 40ac 0fa9 14f5 e89f eca0 5bd1 7870 eff0 bf8f 0337 6052 dc75 0ec9 e776 5246 59a1 5d81 6d95 6e14 633e 58ee 71ff 714c b38e'.split(' '),
  },
  // Final lanes from the XKCP zero-state vector: https://github.com/XKCP/XKCP/blob/master/tests/TestVectors/KeccakF-800-IntermediateValues.txt
  {
    width: 800,
    laneBits: 32,
    expected: 'e531d45d f404c6fb 23a0bf99 f1f8452f 51ffd042 e539f578 f00b80a7 af973664 bf5af34c 227a2424 88172715 9f685884 b15cd054 1bf4fc0e 6166fa91 1a9e599a a3970a1f ab659687 afab8d68 e74b1015 34001a98 4119eff3 930a0e76 87b28070 11efe996'.split(' '),
  },
];

function generate(
  language: 'javascript' | 'python',
  width = 1600,
  stateExpression?: string,
): string {
  const workspace = new Blockly.Workspace();
  try {
    const permutation = workspace.newBlock('keccak_f');
    permutation.setFieldValue(String(width), 'WIDTH');
    const state = workspace.newBlock('data_value');
    state.setFieldValue(
      stateExpression ??
        (language === 'javascript'
          ? `[${Array(25).fill('0n').join(', ')}]`
          : '[0] * 25'),
      'NUM',
    );
    permutation.getInput('STATE')!.connection!.connect(state.outputConnection!);
    const generator = language === 'javascript' ? javascriptGenerator : pythonGenerator;
    return generator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function generateInitialState(language: 'javascript' | 'python'): string {
  const workspace = new Blockly.Workspace();
  try {
    workspace.newBlock('keccak_state_init');
    const generator = language === 'javascript' ? javascriptGenerator : pythonGenerator;
    return generator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function evaluateJavaScript(program: string, laneBits = 64): string[] {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!.replace(/;$/, '');
  return new Function([...lines, `return ${expression}.map((lane) => lane.toString(16).padStart(${laneBits / 4}, '0'));`].join('\n'))() as string[];
}

function evaluatePython(program: string, laneBits = 64): string[] {
  const lines = program.trim().split('\n');
  const expression = lines.pop()!;
  const output = execFileSync(pythonCommand, ['-c', [
    ...lines,
    `print(__import__("json").dumps([format(lane, "0${laneBits / 4}x") for lane in ${expression}]))`,
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  return JSON.parse(output.trim()) as string[];
}

describe('Keccak-f Blockly block', () => {
  it('initializes the sponge state as 25 zero lanes in both generated languages', () => {
    const expected = Array(25).fill('0000000000000000');
    expect(evaluateJavaScript(generateInitialState('javascript'))).toEqual(expected);
    expect(evaluatePython(generateInitialState('python'))).toEqual(expected);
  });

  it('offers only the implemented Keccak-f widths', () => {
    const workspace = new Blockly.Workspace();
    try {
      const permutation = workspace.newBlock('keccak_f');
      const field = permutation.getField('WIDTH') as unknown as {
        getOptions: (useCache: boolean) => Array<[string, string]>;
      };
      expect(field.getOptions(false).map(([, value]) => value)).toEqual([
        '200',
        '400',
        '800',
        '1600',
      ]);
    } finally {
      workspace.dispose();
    }
  });

  it('matches the XKCP Keccak-f[1600] all-zero-state vector in both generated languages', () => {
    // https://github.com/XKCP/XKCP/blob/master/tests/TestVectors/KeccakF-1600-IntermediateValues.txt
    expect(evaluateJavaScript(generate('javascript'))).toEqual(zeroStateOutput);
    expect(evaluatePython(generate('python'))).toEqual(zeroStateOutput);
  });

  it.each(reducedWidthVectors)(
    'matches the XKCP Keccak-f[$width] all-zero-state vector in both generated languages',
    ({ width, laneBits, expected }) => {
      expect(evaluateJavaScript(generate('javascript', width), laneBits)).toEqual(expected);
      expect(evaluatePython(generate('python', width), laneBits)).toEqual(expected);
    },
  );

  it('rejects a state that does not contain exactly 25 lanes in both languages', () => {
    expect(() => evaluateJavaScript(generate('javascript', 200, '[0n]'), 8)).toThrow(
      'Keccak-f state must contain 25 lanes',
    );
    expect(() => evaluatePython(generate('python', 200, '[0]'), 8)).toThrow();
  });

  it('rejects lane values outside the selected width in both languages', () => {
    const jsState = `[256n, ${Array(24).fill('0n').join(', ')}]`;
    const pythonState = '[256] + [0] * 24';
    expect(() => evaluateJavaScript(generate('javascript', 200, jsState), 8)).toThrow(
      'Keccak-f lane is outside the selected width',
    );
    expect(() => evaluatePython(generate('python', 200, pythonState), 8)).toThrow();
  });
});
