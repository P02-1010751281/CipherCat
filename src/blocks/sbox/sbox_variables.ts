import * as Blockly from 'blockly/core';

export const SBOX_VAR_BLOCK_TYPES = [
  'sbox_variables_get',
  'sbox_variables_set',
] as const;

export type SBoxVarBlockType = typeof SBOX_VAR_BLOCK_TYPES[number];

export const blocks = Blockly.common.createBlockDefinitionsFromJsonArray([
  {
    'type': 'sbox_variables_get',
    'message0': '%1',
    'args0': [
      {
        'type': 'field_variable',
        'name': 'VAR',
        'variable': '%{BKY_VARIABLES_DEFAULT_NAME}',
        'variableTypes': ['SBox'],
        'defaultType': 'SBox',
      },
    ],
    'output': 'SBox',
    'style': 'variable_blocks',
    'helpUrl': '%{BKY_VARIABLES_GET_HELPURL}',
    'tooltip': '%{BKY_VARIABLES_GET_TOOLTIP}',
    'extensions': ['contextMenu_variableSetterGetter'],
  },
  {
    'type': 'sbox_variables_set',
    'message0': '%{BKY_VARIABLES_SET}',
    'args0': [
      {
        'type': 'field_variable',
        'name': 'VAR',
        'variable': '%{BKY_VARIABLES_DEFAULT_NAME}',
        'variableTypes': ['SBox'],
        'defaultType': 'SBox',
      },
      {
        'type': 'input_value',
        'name': 'VALUE',
        'check': 'SBox',
      },
    ],
    'previousStatement': null,
    'nextStatement': null,
    'style': 'variable_blocks',
    'tooltip': '%{BKY_VARIABLES_SET_TOOLTIP}',
    'helpUrl': '%{BKY_VARIABLES_SET_HELPURL}',
    'extensions': ['contextMenu_variableSetterGetter'],
  },
]);

Blockly.common.defineBlocks(blocks);
