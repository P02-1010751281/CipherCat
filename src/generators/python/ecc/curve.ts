import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly';

function registerCurvePointValidator(): string {
  return pythonGenerator.provideFunction_('ecc_validate_curve_point', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(point, curve):',
    '    a, b, p = curve["a"], curve["b"], curve["p"]',
    '    if type(a) is not int or type(b) is not int or type(p) is not int or p <= 3 or not 0 <= a < p or not 0 <= b < p:',
    '        raise ValueError("invalid prime-field curve parameters")',
    '    if (4 * a * a * a + 27 * b * b) % p == 0:',
    '        raise ValueError("singular curve")',
    '    if type(point) is not dict:',
    '        raise TypeError("point must be a plain dictionary")',
    '    infinity = point.get("infinity", False)',
    '    if type(infinity) is not bool:',
    '        raise TypeError("infinity marker must be boolean")',
    '    if infinity:',
    '        return point',
    '    x, y = point.get("x"), point.get("y")',
    '    if type(x) is not int or type(y) is not int or not 0 <= x < p or not 0 <= y < p:',
    '        raise ValueError("point coordinates must be integers in the field")',
    '    if (y * y - x * x * x - a * x - b) % p != 0:',
    '        raise ValueError("point is not on the configured curve")',
    '    return point',
  ]);
}

pythonGenerator.forBlock['ecc_load_curve_params'] = function(block: Block): string {
  const a = block.getFieldValue('a') || '0';
  const b = block.getFieldValue('b') || '0';
  const p = block.getFieldValue('p') || '0';

  const validate = registerCurvePointValidator();
  return `curve = {"a": ${a}, "b": ${b}, "p": ${p}}\n${validate}({"infinity": True}, curve)\n`;
};

pythonGenerator.forBlock['ecc_load_point'] = function(block: Block): string {
  const point = pythonGenerator.valueToCode(block, 'point', Order.ATOMIC) || 'P';
  const x = block.getFieldValue('x') || '0';
  const y = block.getFieldValue('y') || '0';
  const validate = registerCurvePointValidator();

  return `${point} = {"x": ${x}, "y": ${y}}\n${validate}(${point}, curve)\n`;
};

pythonGenerator.forBlock['ecc_point_double'] = function(block: Block): string {
  const value1 = pythonGenerator.valueToCode(block, 'value1', Order.ATOMIC) || 'P';
  const value2 = pythonGenerator.valueToCode(block, 'value2', Order.ATOMIC) || 'R';
  const validate = registerCurvePointValidator();

  return `
# 点倍点运算
${validate}(${value1}, curve)
if ${value1}.get("infinity", False) or ${value1}["y"] % curve["p"] == 0:
    ${value2} = {"infinity": True}
else:
    lambda_val = (3 * ${value1}["x"] * ${value1}["x"] + curve["a"]) * pow(2 * ${value1}["y"], -1, curve["p"]) % curve["p"]
    ${value2} = {
        "x": (lambda_val * lambda_val - 2 * ${value1}["x"]) % curve["p"],
        "y": (lambda_val * (${value1}["x"] - ((lambda_val * lambda_val - 2 * ${value1}["x"]) % curve["p"])) - ${value1}["y"]) % curve["p"]
    }
`;
};

pythonGenerator.forBlock['ecc_add'] = function(block: Block): string {
  const value1 = pythonGenerator.valueToCode(block, 'value1', Order.ATOMIC) || 'P';
  const value2 = pythonGenerator.valueToCode(block, 'value2', Order.ATOMIC) || 'Q';
  const value3 = pythonGenerator.valueToCode(block, 'value3', Order.ATOMIC) || 'R';
  const validate = registerCurvePointValidator();

  return `
# 点加法运算
${validate}(${value1}, curve)
${validate}(${value2}, curve)
if ${value1}.get("infinity", False):
    ${value3} = ${value2}
elif ${value2}.get("infinity", False):
    ${value3} = ${value1}
elif ${value1}["x"] == ${value2}["x"] and (${value1}["y"] + ${value2}["y"]) % curve["p"] == 0:
    ${value3} = {"infinity": True}
elif ${value1}["x"] == ${value2}["x"] and ${value1}["y"] == ${value2}["y"]:
    # 点相同，调用倍点公式
    lambda_val = (3 * ${value1}["x"] * ${value1}["x"] + curve["a"]) * pow(2 * ${value1}["y"], -1, curve["p"]) % curve["p"]
    ${value3} = {
        "x": (lambda_val * lambda_val - 2 * ${value1}["x"]) % curve["p"],
        "y": (lambda_val * (${value1}["x"] - ((lambda_val * lambda_val - 2 * ${value1}["x"]) % curve["p"])) - ${value1}["y"]) % curve["p"]
    }
elif ${value1}["x"] == ${value2}["x"]:
    raise ValueError("points with equal x must be equal or inverses")
else:
    # 点不同，使用加法公式
    lambda_val = (${value2}["y"] - ${value1}["y"]) * pow(${value2}["x"] - ${value1}["x"], -1, curve["p"]) % curve["p"]
    ${value3} = {
        "x": (lambda_val * lambda_val - ${value1}["x"] - ${value2}["x"]) % curve["p"],
        "y": (lambda_val * (${value1}["x"] - ((lambda_val * lambda_val - ${value1}["x"] - ${value2}["x"]) % curve["p"])) - ${value1}["y"]) % curve["p"]
    }
if not ${value3}.get("infinity", False):
    if ${value3}["x"] < 0:
        ${value3}["x"] += curve["p"]
    if ${value3}["y"] < 0:
        ${value3}["y"] += curve["p"]
`;
};

pythonGenerator.forBlock['ecc_multiply'] = function(block: Block): string {
  const value1 = pythonGenerator.valueToCode(block, 'value1', Order.ATOMIC) || 'P';
  const value2 = pythonGenerator.valueToCode(block, 'value2', Order.ATOMIC) || 'R';
  const times = block.getFieldValue('times') || '0';
  const validate = registerCurvePointValidator();

  return `
# 点乘法运算 - 使用倍加算法
${validate}(${value1}, curve)
k = ${times}
if type(k) is not int or k < 0:
    raise ValueError("scalar must be a non-negative integer")
P_temp = ${value1}.copy()
result = {"infinity": True}

while k > 0:
    if k & 1:
        # 如果结果点为无穷远点，则直接赋值为当前点
        if not P_temp.get("infinity", False) and result["infinity"]:
            result = {"x": P_temp["x"], "y": P_temp["y"], "infinity": False}
        elif not P_temp.get("infinity", False) and result["x"] == P_temp["x"] and (result["y"] + P_temp["y"]) % curve["p"] == 0:
            result = {"infinity": True}
        elif not P_temp.get("infinity", False) and result["x"] == P_temp["x"] and result["y"] == P_temp["y"]:
            lambda_val = (3 * P_temp["x"] * P_temp["x"] + curve["a"]) * pow(2 * P_temp["y"], -1, curve["p"]) % curve["p"]
            x = (lambda_val * lambda_val - 2 * P_temp["x"]) % curve["p"]
            y = (lambda_val * (P_temp["x"] - x) - P_temp["y"]) % curve["p"]
            result = {"x": x, "y": y, "infinity": False}
        elif not P_temp.get("infinity", False):
            # 点加运算
            lambda_val = (result["y"] - P_temp["y"]) * pow(result["x"] - P_temp["x"], -1, curve["p"]) % curve["p"]
            x = (lambda_val * lambda_val - result["x"] - P_temp["x"]) % curve["p"]
            y = (lambda_val * (result["x"] - x) - result["y"]) % curve["p"]
            result = {"x": x, "y": y, "infinity": False}

    # 倍点运算
    if P_temp.get("infinity", False) or P_temp["y"] % curve["p"] == 0:
        P_temp = {"infinity": True}
    else:
        lambda_val = (3 * P_temp["x"] * P_temp["x"] + curve["a"]) * pow(2 * P_temp["y"], -1, curve["p"]) % curve["p"]
        x = (lambda_val * lambda_val - 2 * P_temp["x"]) % curve["p"]
        y = (lambda_val * (P_temp["x"] - x) - P_temp["y"]) % curve["p"]
        P_temp = {"x": x, "y": y}

    k = k >> 1

    if not result["infinity"]:
        if result["x"] < 0:
            result["x"] += curve["p"]
        if result["y"] < 0:
            result["y"] += curve["p"]
    if not P_temp.get("infinity", False):
        if P_temp["x"] < 0:
            P_temp["x"] += curve["p"]
        if P_temp["y"] < 0:
            P_temp["y"] += curve["p"]

${value2} = {"infinity": True} if result["infinity"] else {"x": result["x"], "y": result["y"]}

# Python中使用内置的pow(a, -1, m)来计算模逆
`;
};
