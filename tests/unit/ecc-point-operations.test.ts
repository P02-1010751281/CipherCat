// @vitest-environment jsdom
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import '@/blocks/data/number';
import '@/blocks/ecc/curve';
import '@/generators/javascript';
import '@/generators/javascript/ecc/curve';
import '@/generators/python';
import '@/generators/python/ecc/curve';
import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

const pythonCommand = process.env.CIPHER_CAT_PYTHON ||
  (process.platform === 'win32' ? 'python' : 'python3');

function generate(
  language: 'javascript' | 'python',
  operation: 'ecc_add' | 'ecc_point_double' | 'ecc_multiply',
  points: string[],
  curve = { a: 2, b: 2, p: 17 },
  scalar: number | string = 1,
): string {
  const workspace = new Blockly.Workspace();
  try {
    const parameters = workspace.newBlock('ecc_load_curve_params');
    parameters.setFieldValue(String(curve.a), 'a');
    parameters.setFieldValue(String(curve.b), 'b');
    parameters.setFieldValue(String(curve.p), 'p');

    const block = workspace.newBlock(operation);
    if (operation === 'ecc_multiply') block.setFieldValue(String(scalar), 'times');
    const inputNames = operation === 'ecc_add' ? ['value1', 'value2'] : ['value1'];
    inputNames.forEach((name, index) => {
      const value = workspace.newBlock('data_value');
      value.setFieldValue(points[index], 'NUM');
      block.getInput(name)!.connection!.connect(value.outputConnection!);
    });
    const output = workspace.newBlock('data_value');
    output.setFieldValue('R', 'NUM');
    block.getInput(operation === 'ecc_add' ? 'value3' : 'value2')!.connection!.connect(
      output.outputConnection!,
    );

    const generator = language === 'javascript' ? javascriptGenerator : pythonGenerator;
    return generator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function generatePointLoad(
  language: 'javascript' | 'python',
  x: number,
  y: number,
  curve = { a: 2, b: 2, p: 17 },
): string {
  const workspace = new Blockly.Workspace();
  try {
    const parameters = workspace.newBlock('ecc_load_curve_params');
    parameters.setFieldValue(String(curve.a), 'a');
    parameters.setFieldValue(String(curve.b), 'b');
    parameters.setFieldValue(String(curve.p), 'p');

    const point = workspace.newBlock('ecc_load_point');
    point.setFieldValue(String(x), 'x');
    point.setFieldValue(String(y), 'y');
    const name = workspace.newBlock('data_value');
    name.setFieldValue('P', 'NUM');
    point.getInput('point')!.connection!.connect(name.outputConnection!);

    const generator = language === 'javascript' ? javascriptGenerator : pythonGenerator;
    return generator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function runJavaScript(program: string): { x?: string; y?: string; infinity?: boolean } {
  const result = new Function(`${program}\nreturn R;`)() as {
    x?: bigint;
    y?: bigint;
    infinity?: boolean;
  };
  return {
    ...(result.x === undefined ? {} : { x: result.x.toString() }),
    ...(result.y === undefined ? {} : { y: result.y.toString() }),
    ...(result.infinity === undefined ? {} : { infinity: result.infinity }),
  };
}

function runPython(program: string): { x?: string; y?: string; infinity?: boolean } {
  const output = execFileSync(pythonCommand, ['-c', [
    'import json',
    program,
    'print(json.dumps({"x": str(R["x"]) if "x" in R else None, "y": str(R["y"]) if "y" in R else None, "infinity": R.get("infinity")}))',
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const result = JSON.parse(output) as { x: string | null; y: string | null; infinity?: boolean | null };
  return {
    ...(result.x === null ? {} : { x: result.x }),
    ...(result.y === null ? {} : { y: result.y }),
    ...(result.infinity == null ? {} : { infinity: result.infinity }),
  };
}

function capturePythonError(program: string): string {
  const wrapped = [
    'try:',
    ...program.trimEnd().split('\n').map((line) => `    ${line}`),
    'except Exception as error:',
    '    print(type(error).__name__ + ":" + str(error))',
  ].join('\n');
  return execFileSync(pythonCommand, ['-c', wrapped], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function loadPointJavaScript(program: string): { x: bigint; y: bigint } {
  return new Function(`${program}\nreturn P;`)() as { x: bigint; y: bigint };
}

function loadPointPython(program: string): { x: number; y: number } {
  const output = execFileSync(pythonCommand, ['-c', [
    'import json',
    program,
    'print(json.dumps(P))',
  ].join('\n')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  return JSON.parse(output) as { x: number; y: number };
}

describe('ECC point-operation Blockly blocks', () => {
  it('doubles and adds finite points over a small prime-field curve in both languages', () => {
    const p = '{x: 5n, y: 1n}';
    const q = '{x: 6n, y: 3n}';
    const pyP = '{"x": 5, "y": 1}';
    const pyQ = '{"x": 6, "y": 3}';

    expect(runJavaScript(generate('javascript', 'ecc_point_double', [p]))).toEqual({ x: '6', y: '3' });
    expect(runPython(generate('python', 'ecc_point_double', [pyP]))).toEqual({ x: '6', y: '3' });
    expect(runJavaScript(generate('javascript', 'ecc_add', [p, q]))).toEqual({ x: '10', y: '6' });
    expect(runPython(generate('python', 'ecc_add', [pyP, pyQ]))).toEqual({ x: '10', y: '6' });
  });

  it('returns the point at infinity when adding inverse points', () => {
    const inverseSumJs = generate('javascript', 'ecc_add', [
      '{x: 5n, y: 1n}',
      '{x: 5n, y: 16n}',
    ]);
    const inverseSumPy = generate('python', 'ecc_add', [
      '{"x": 5, "y": 1}',
      '{"x": 5, "y": 16}',
    ]);
    expect(runJavaScript(inverseSumJs)).toEqual({ infinity: true });
    expect(runPython(inverseSumPy)).toEqual({ infinity: true });
  });

  it('rejects same-x inputs that are neither equal nor inverse points', () => {
    const js = generate('javascript', 'ecc_add', ['{x: 5n, y: 1n}', '{x: 5n, y: 2n}']);
    const py = generate('python', 'ecc_add', ['{"x": 5, "y": 1}', '{"x": 5, "y": 2}']);

    expect(() => runJavaScript(js)).toThrow();
    expect(() => runPython(py)).toThrow();
  });

  it('validates loaded coordinates against the configured curve in both languages', () => {
    expect(loadPointJavaScript(generatePointLoad('javascript', 5, 1))).toEqual({ x: 5n, y: 1n });
    expect(loadPointPython(generatePointLoad('python', 5, 1))).toEqual({ x: 5, y: 1 });

    for (const [x, y] of [[17, 1], [5, 2]]) {
      expect(() => loadPointJavaScript(generatePointLoad('javascript', x, y))).toThrow();
      expect(() => loadPointPython(generatePointLoad('python', x, y))).toThrow();
    }
  });

  it('rejects singular curves and non-boolean infinity markers in both languages', () => {
    expect(() => loadPointJavaScript(generatePointLoad('javascript', 0, 1, { a: 0, b: 0, p: 17 })))
      .toThrow(/singular curve/);
    expect(() => loadPointPython(generatePointLoad('python', 0, 1, { a: 0, b: 0, p: 17 })))
      .toThrow(/singular curve/);

    for (const [jsMarker, pyMarker] of [['1', '1'], ['"yes"', '"yes"']]) {
      const js = generate('javascript', 'ecc_add', [`{infinity: ${jsMarker}, x: 5n, y: 1n}`, '{x: 5n, y: 1n}']);
      const py = generate('python', 'ecc_add', [`{"infinity": ${pyMarker}, "x": 5, "y": 1}`, '{"x": 5, "y": 1}']);
      expect(() => runJavaScript(js)).toThrow(/infinity marker/);
      expect(() => runPython(py)).toThrow(/infinity marker/);
    }
  });

  it('rejects a modular inverse that does not exist in both languages', () => {
    const js = generate('javascript', 'ecc_add', ['{x: 0n, y: 1n}', '{x: 9n, y: 5n}'], { a: 0, b: 1, p: 15 });
    const py = generate('python', 'ecc_add', ['{"x": 0, "y": 1}', '{"x": 9, "y": 5}'], { a: 0, b: 1, p: 15 });

    expect(() => runJavaScript(js)).toThrow();
    expect(() => runPython(py)).toThrow();
  });

  it('uses the point at infinity as the identity for point addition', () => {
    for (const [leftJs, rightJs, leftPy, rightPy] of [
      ['{infinity: true}', '{x: 5n, y: 1n}', '{"infinity": True}', '{"x": 5, "y": 1}'],
      ['{x: 5n, y: 1n}', '{infinity: true}', '{"x": 5, "y": 1}', '{"infinity": True}'],
    ]) {
      expect(runJavaScript(generate('javascript', 'ecc_add', [leftJs, rightJs])))
        .toEqual({ x: '5', y: '1' });
      expect(runPython(generate('python', 'ecc_add', [leftPy, rightPy])))
        .toEqual({ x: '5', y: '1' });
    }
  });

  it('returns the point at infinity when doubling a point with y = 0', () => {
    const zeroDoubleJs = generate('javascript', 'ecc_point_double', ['{x: 0n, y: 0n}'], { a: 1, b: 0, p: 17 });
    const zeroDoublePy = generate('python', 'ecc_point_double', ['{"x": 0, "y": 0}'], { a: 1, b: 0, p: 17 });

    expect(runJavaScript(zeroDoubleJs)).toEqual({ infinity: true });
    expect(runPython(zeroDoublePy)).toEqual({ infinity: true });
  });

  it('preserves the point-at-infinity representation for scalar multiplication', () => {
    const pointJs = '{x: 5n, y: 1n}';
    const pointPy = '{"x": 5, "y": 1}';

    expect(runJavaScript(generate('javascript', 'ecc_multiply', [pointJs], undefined, 0)))
      .toEqual({ infinity: true });
    expect(runPython(generate('python', 'ecc_multiply', [pointPy], undefined, 0)))
      .toEqual({ infinity: true });
    expect(runJavaScript(generate('javascript', 'ecc_multiply', [pointJs], undefined, 1)))
      .toEqual({ x: '5', y: '1' });
    expect(runPython(generate('python', 'ecc_multiply', [pointPy], undefined, 1)))
      .toEqual({ x: '5', y: '1' });
    expect(runJavaScript(generate('javascript', 'ecc_multiply', [pointJs], undefined, 2)))
      .toEqual({ x: '6', y: '3' });
    expect(runPython(generate('python', 'ecc_multiply', [pointPy], undefined, 2)))
      .toEqual({ x: '6', y: '3' });
    expect(runJavaScript(generate('javascript', 'ecc_multiply', [pointJs], undefined, 3)))
      .toEqual({ x: '10', y: '6' });
    expect(runPython(generate('python', 'ecc_multiply', [pointPy], undefined, 3)))
      .toEqual({ x: '10', y: '6' });
    expect(runJavaScript(generate('javascript', 'ecc_multiply', [pointJs], undefined, 19)))
      .toEqual({ infinity: true });
    expect(runPython(generate('python', 'ecc_multiply', [pointPy], undefined, 19)))
      .toEqual({ infinity: true });
    expect(runJavaScript(generate('javascript', 'ecc_multiply', ['{x: 0n, y: 0n}'], { a: 1, b: 0, p: 17 }, 2)))
      .toEqual({ infinity: true });
    expect(() => runJavaScript(generate('javascript', 'ecc_multiply', [pointJs], undefined, -1)))
      .toThrow();
    expect(() => runPython(generate('python', 'ecc_multiply', [pointPy], undefined, -1)))
      .toThrow();
    expect(runPython(generate('python', 'ecc_multiply', ['{"x": 0, "y": 0}'], { a: 1, b: 0, p: 17 }, 2)))
      .toEqual({ infinity: true });
    expect(runJavaScript(generate('javascript', 'ecc_multiply', ['{x: 0n, y: 0n}'], { a: 1, b: 0, p: 17 }, 3)))
      .toEqual({ x: '0', y: '0' });
    expect(runPython(generate('python', 'ecc_multiply', ['{"x": 0, "y": 0}'], { a: 1, b: 0, p: 17 }, 3)))
      .toEqual({ x: '0', y: '0' });
  });

  it('rejects non-integer and boolean scalar fields in both languages', () => {
    const pointJs = '{x: 5n, y: 1n}';
    const pointPy = '{"x": 5, "y": 1}';
    for (const scalar of ['0.0', '1.5', 'False']) {
      expect(() => runJavaScript(generate('javascript', 'ecc_multiply', [pointJs], undefined, scalar))).toThrow();
      expect(() => runPython(generate('python', 'ecc_multiply', [pointPy], undefined, scalar))).toThrow();
    }
  });

  it('rejects an inherited infinity marker rather than treating it as an own marker', () => {
    const inheritedPoint = 'Object.assign(Object.create({ infinity: true }), { x: 5n, y: 1n })';
    expect(() => runJavaScript(generate('javascript', 'ecc_add', [inheritedPoint, '{x: 6n, y: 3n}'])))
      .toThrow(/infinity marker must be an own property/);
    expect(runPython(generate('python', 'ecc_add', ['{"x": 5, "y": 1}', '{"x": 6, "y": 3}'])))
      .toEqual({ x: '10', y: '6' });
  });

  it('rejects inherited coordinates in JavaScript to match the Python point contract', () => {
    const inheritedPoint = 'Object.create({ x: 5n, y: 1n })';
    expect(() => runJavaScript(generate('javascript', 'ecc_add', [inheritedPoint, '{x: 6n, y: 3n}'])))
      .toThrow(/own properties/);
    expect(runPython(generate('python', 'ecc_add', ['{"x": 5, "y": 1}', '{"x": 6, "y": 3}'])))
      .toEqual({ x: '10', y: '6' });
  });

  it('rejects Python dict subclasses that fake coordinates through get()', () => {
    const fakePoint = 'type("Point", (dict,), {"get": lambda self, key, default=None: {"x": 5, "y": 1}.get(key, default)})()';
    const program = generate('python', 'ecc_add', [fakePoint, '{"x": 6, "y": 3}']);
    expect(capturePythonError(program)).toContain('point must be a plain dictionary');
  });
});
