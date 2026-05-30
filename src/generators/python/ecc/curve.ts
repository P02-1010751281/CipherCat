import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly';

pythonGenerator.forBlock['ecc_load_curve_params'] = function(block: Block): string {
  const a = block.getFieldValue('a') || '0';
  const b = block.getFieldValue('b') || '0';
  const p = block.getFieldValue('p') || '0';

  return `curve = {"a": ${a}, "b": ${b}, "p": ${p}}\n`;
};

pythonGenerator.forBlock['ecc_load_point'] = function(block: Block): string {
  const point = pythonGenerator.valueToCode(block, 'point', Order.ATOMIC) || 'P';
  const x = block.getFieldValue('x') || '0';
  const y = block.getFieldValue('y') || '0';

  return `${point} = {"x": ${x}, "y": ${y}}\n`;
};

pythonGenerator.forBlock['ecc_point_double'] = function(block: Block): string {
  const value1 = pythonGenerator.valueToCode(block, 'value1', Order.ATOMIC) || 'P';
  const value2 = pythonGenerator.valueToCode(block, 'value2', Order.ATOMIC) || 'R';

  return `
# 点倍点运算
lambda_val = (3 * ${value1}["x"] * ${value1}["x"] + curve["a"]) * pow(2 * ${value1}["y"], -1, curve["p"]) % curve["p"]
${value2} = {
    "x": (lambda_val * lambda_val - 2 * ${value1}["x"]) % curve["p"],
    "y": (lambda_val * (${value1}["x"] - ((lambda_val * lambda_val - 2 * ${value1}["x"]) % curve["p"])) - ${value1}["y"]) % curve["p"]
}
if ${value2}["x"] < 0:
    ${value2}["x"] += curve["p"]
if ${value2}["y"] < 0:
    ${value2}["y"] += curve["p"]
`;
};

pythonGenerator.forBlock['ecc_add'] = function(block: Block): string {
  const value1 = pythonGenerator.valueToCode(block, 'value1', Order.ATOMIC) || 'P';
  const value2 = pythonGenerator.valueToCode(block, 'value2', Order.ATOMIC) || 'Q';
  const value3 = pythonGenerator.valueToCode(block, 'value3', Order.ATOMIC) || 'R';

  return `
# 点加法运算
if ${value1}["x"] == ${value2}["x"] and ${value1}["y"] == ${value2}["y"]:
    # 点相同，调用倍点公式
    lambda_val = (3 * ${value1}["x"] * ${value1}["x"] + curve["a"]) * pow(2 * ${value1}["y"], -1, curve["p"]) % curve["p"]
    ${value3} = {
        "x": (lambda_val * lambda_val - 2 * ${value1}["x"]) % curve["p"],
        "y": (lambda_val * (${value1}["x"] - ((lambda_val * lambda_val - 2 * ${value1}["x"]) % curve["p"])) - ${value1}["y"]) % curve["p"]
    }
else:
    # 点不同，使用加法公式
    lambda_val = (${value2}["y"] - ${value1}["y"]) * pow(${value2}["x"] - ${value1}["x"], -1, curve["p"]) % curve["p"]
    ${value3} = {
        "x": (lambda_val * lambda_val - ${value1}["x"] - ${value2}["x"]) % curve["p"],
        "y": (lambda_val * (${value1}["x"] - ((lambda_val * lambda_val - ${value1}["x"] - ${value2}["x"]) % curve["p"])) - ${value1}["y"]) % curve["p"]
    }
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

  return `
# 点乘法运算 - 使用倍加算法
k = ${times}
P_temp = ${value1}.copy()
result = {"x": 0, "y": 0, "infinity": True}

while k > 0:
    if k & 1:
        # 如果结果点为无穷远点，则直接赋值为当前点
        if result["infinity"]:
            result = {"x": P_temp["x"], "y": P_temp["y"], "infinity": False}
        else:
            # 点加运算
            lambda_val = (result["y"] - P_temp["y"]) * pow(result["x"] - P_temp["x"], -1, curve["p"]) % curve["p"]
            x = (lambda_val * lambda_val - result["x"] - P_temp["x"]) % curve["p"]
            y = (lambda_val * (result["x"] - x) - result["y"]) % curve["p"]
            result = {"x": x, "y": y, "infinity": False}

    # 倍点运算
    lambda_val = (3 * P_temp["x"] * P_temp["x"] + curve["a"]) * pow(2 * P_temp["y"], -1, curve["p"]) % curve["p"]
    x = (lambda_val * lambda_val - 2 * P_temp["x"]) % curve["p"]
    y = (lambda_val * (P_temp["x"] - x) - P_temp["y"]) % curve["p"]
    P_temp = {"x": x, "y": y}

    k = k >> 1

    if result["x"] < 0:
        result["x"] += curve["p"]
    if result["y"] < 0:
        result["y"] += curve["p"]
    if P_temp["x"] < 0:
        P_temp["x"] += curve["p"]
    if P_temp["y"] < 0:
        P_temp["y"] += curve["p"]

${value2} = {"x": result["x"], "y": result["y"]}

# Python中使用内置的pow(a, -1, m)来计算模逆
`;
};
