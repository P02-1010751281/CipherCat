const BLOCK_TYPE_MIGRATION_MAP: Record<string, string> = {
  crypto_assign: 'ctrl_assign',
  crypto_iterate: 'ctrl_iterate',
  math_number: 'data_value',
  crypto_number: 'data_value',
  crypto_expr_infix: 'bit_expr_infix',
  crypto_bitwise_expr: 'bit_operation',
  crypto_bitwise_not32: 'bit_not32',
  crypto_not: 'lgc_not',
  crypto_xor: 'lgc_operation',
  crypto_logic_compound: 'lgc_compound',
  crypto_rotate_left: 'bit_rotate_left',
  crypto_rotate_left_op: 'bit_rotate_left_op',
  crypto_rotate_right: 'bit_rotate_right',
  crypto_rotate_right_op: 'bit_rotate_right_op',
  crypto_byte_substitute: 'bit_byte_substitute',
  crypto_sbox: 'sbox',
  // crypto_sbox_def 由 migrateSboxDefXml / migrateSboxDefJson 自定义迁移
  crypto_sbox_4x4: 'sbox',
  crypto_sbox_8x8: 'sbox',
  crypto_sbox_16x16: 'sbox',
  crypto_sbox_16x16_settings: 'sbox',
  crypto_sbox_8x8_settings: 'sbox',
  crypto_sbox_configurable: 'sbox',
  crypto_sm4_sbox_sub: 'sbox_sub',
  crypto_get_text: 'data_value',
  crypto_bit_length: 'data_bit_length',
  crypto_convert_to_int: 'data_convert_to_int',
  crypto_partition_to_array: 'arr_partition_to_array',
  crypto_load_curve_params: 'ecc_load_curve_params',
  crypto_load_point: 'ecc_load_point',
  crypto_point_double: 'ecc_point_double',
  crypto_ecc_add: 'ecc_add',
  crypto_ecc_multiply: 'ecc_multiply',
  crypto_mod_inverse: 'nt_mod_inverse',
  crypto_sm3_pad_text: 'hash_sm3_pad_text',
  crypto_sm3_pad_hex: 'hash_sm3_pad_hex',
  crypto_sm3_pad: 'hash_sm3_pad',
  crypto_sm3_compress: 'hash_sm3_compress',
  crypto_sha256_pad: 'hash_sha256_pad',
  crypto_sha256_pad_hex: 'hash_sha256_pad_hex',
  crypto_sha256_pad_text: 'hash_sha256_pad_text',
};

export function migrateBlockType(oldType: string): string {
  return BLOCK_TYPE_MIGRATION_MAP[oldType] || oldType;
}

export function migrateXmlText(xmlText: string): string {
  if (!xmlText || !xmlText.trim()) return xmlText;

  let result = xmlText;

  result = migrateSboxXml(result);

  const sortedEntries = Object.entries(BLOCK_TYPE_MIGRATION_MAP).sort(
    ([a], [b]) => b.length - a.length,
  );
  for (const [oldType, newType] of sortedEntries) {
    if (result.includes(`type="${oldType}"`)) {
      result = result.replace(
        new RegExp(`type="${oldType}"`, 'g'),
        `type="${newType}"`,
      );
    }
    if (result.includes(`type='${oldType}'`)) {
      result = result.replace(
        new RegExp(`type='${oldType}'`, 'g'),
        `type='${newType}'`,
      );
    }
    if (oldType === 'crypto_get_text' && newType === 'data_value') {
      result = result.replace(/<field name="TEXT"/g, '<field name="NUM"');
    }
  }

  // crypto_sbox_def / sbox_def → sbox_variables_set: 结构迁移
  result = migrateSboxDefXml(result);

  result = migrateCompoundFieldXml(result);
  result = migrateBitOperationFieldXml(result);

  return result;
}

function migrateSboxXml(xml: string): string {
  let result = xml;

  // Old SXX (hex) field names → SBox_R_C
  result = result.replace(
    /<field name="S([0-9A-F])([0-9A-F])"/gi,
    (_, rowHex, colHex) => {
      const row = parseInt(rowHex, 16);
      const col = parseInt(colHex, 16);
      return `<field name="SBox_${row}_${col}"`;
    },
  );

  let defaultSize = 16;
  if (result.includes('crypto_sbox_4x4')) defaultSize = 4;
  else if (result.includes('crypto_sbox_8x8')) defaultSize = 8;

  const sboxOldTypes = [
    'crypto_sbox_16x16',
    'crypto_sbox_16x16_settings',
    'crypto_sbox_8x8',
    'crypto_sbox_8x8_settings',
    'crypto_sbox_4x4',
    'crypto_sbox_configurable',
    'crypto_sbox',
  ];

  for (const oldType of sboxOldTypes) {
    if (!result.includes(oldType)) continue;
    result = result.replace(
      new RegExp(`type="${oldType}"`, 'g'),
      'type="sbox"',
    );
  }

  // Add <mutation> for blocks that don't already have one
  result = result.replace(
    /<block type="sbox"[^>]*>(?!\s*<mutation)/g,
    '$&<mutation row="' +
      defaultSize +
      '" col="' +
      defaultSize +
      '" output_format="2d"></mutation>',
  );

  return result;
}

/**
 * crypto_sbox_def / sbox_def → sbox_variables_set 结构迁移 (XML)
 *
 * 旧结构: <block type="sbox_def"><value name="new_box">...</value></block>
 * 新结构: <block type="sbox_variables_set">
 *           <field name="VAR" id="..." variabletype="SBox">sbox</field>
 *           <value name="VALUE">...</value>
 *         </block>
 */
function migrateSboxDefXml(xml: string): string {
  let result = xml;

  const blockRe =
    /<block type="(?:crypto_sbox_def|sbox_def)"[^>]*>[\s\S]*?<\/block>/g;

  result = result.replace(blockRe, (match) => {
    if (match.includes('sbox_variables_set')) return match;

    const varId = 'sbox_migrated_' + simpleHash(match.slice(0, 80));

    let m = match;
    m = m.replace(
      /type="(?:crypto_sbox_def|sbox_def)"/,
      'type="sbox_variables_set"',
    );
    m = m.replace(/name="new_box"/g, 'name="VALUE"');
    m = m.replace(
      /(<value name="VALUE")/,
      `<field name="VAR" id="${varId}" variabletype="SBox">sbox</field>$1`,
    );
    return m;
  });

  return result;
}

function simpleHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

function migrateCompoundFieldXml(xml: string): string {
  return xml.replace(
    /(<block type="lgc_compound"[^>]*>[\s\S]*?<field name="instr">)(XOR|OR|AND)(<\/field>)/g,
    (_, prefix, value, suffix) => {
      const map: Record<string, string> = {
        XOR: 'XOR_XOR',
        OR: 'OR_OR',
        AND: 'AND_AND',
      };
      return prefix + (map[value] || value) + suffix;
    },
  );
}

function migrateBitOperationFieldXml(xml: string): string {
  const opMap: Record<string, string> = {
    ROR32: 'RIGHT_ROTATE',
    SHR32: 'RIGHT_SHIFT',
  };
  return xml.replace(
    /(<block type="(?:crypto_bitwise_expr|bit_operation)"[^>]*>[\s\S]*?<field name="OP">)(ROR32|SHR32)(<\/field>)/g,
    (_, prefix, value, suffix) => {
      return prefix + (opMap[value] || value) + suffix;
    },
  );
}

export function migrateJsonState(
  state: Record<string, unknown>,
): Record<string, unknown> {
  if (!state || typeof state !== 'object') return state;

  let jsonStr = JSON.stringify(state);

  jsonStr = migrateSboxFieldNamesJson(jsonStr);

  const sortedEntries = Object.entries(BLOCK_TYPE_MIGRATION_MAP).sort(
    ([a], [b]) => b.length - a.length,
  );
  for (const [oldType, newType] of sortedEntries) {
    if (jsonStr.includes(`"${oldType}"`)) {
      jsonStr = jsonStr.replace(
        new RegExp(`"${oldType}"`, 'g'),
        `"${newType}"`,
      );
    }
  }

  try {
    const parsed = JSON.parse(jsonStr);
    injectSboxRowColFields(parsed);
    migrateSboxJsonMutateData(parsed);
    migrateSboxDefJson(parsed);
    // deferSboxFields 已移除：Blockly 12 原生支持大量字段，不再搬移到 _sbx_def_
    migrateCompoundInstrField(parsed);
    migrateBitOpFieldValues(parsed);
    return parsed as Record<string, unknown>;
  } catch {
    return state;
  }
}

function migrateSboxFieldNamesJson(json: string): string {
  return json.replace(/"S([0-9A-F])([0-9A-F])"/gi, (_, rowHex, colHex) => {
    const row = parseInt(rowHex, 16);
    const col = parseInt(colHex, 16);
    return `"SBox_${row}_${col}"`;
  });
}

const SBOX_ALIASES = new Set([
  'sbox',
  'sbox_4x4',
  'sbox_8x8',
  'sbox_16x16',
  'sbox_16x16_settings',
  'sbox_8x8_settings',
  'crypto_sbox_configurable',
]);

function isSboxType(type: unknown): boolean {
  return typeof type === 'string' && SBOX_ALIASES.has(type);
}

function injectSboxRowColFields(obj: unknown): void {
  if (Array.isArray(obj)) {
    for (const item of obj) injectSboxRowColFields(item);
    return;
  }
  if (typeof obj !== 'object' || obj === null) return;

  const record = obj as Record<string, unknown>;

  if (
    isSboxType(record.type) &&
    record.fields &&
    typeof record.fields === 'object'
  ) {
    const fields = record.fields as Record<string, unknown>;
    if (!('ROW' in fields)) {
      record.fields = {
        ROW: 16,
        COL: 16,
        OUTPUT_FORMAT: '2d',
        ...fields,
      };
    }
    record.type = 'sbox';
  }

  for (const key of Object.keys(record)) {
    injectSboxRowColFields(record[key]);
  }
}

/**
 * Migrate old SBox_X_Y field values into mutations.data for JSON state.
 */
function migrateSboxJsonMutateData(obj: unknown): void {
  if (Array.isArray(obj)) {
    for (const item of obj) migrateSboxJsonMutateData(item);
    return;
  }
  if (typeof obj !== 'object' || obj === null) return;

  const record = obj as Record<string, unknown>;

  if (
    record.type === 'sbox' &&
    record.fields &&
    typeof record.fields === 'object'
  ) {
    const fields = record.fields as Record<string, unknown>;

    // Ensure extraState container exists (Blockly 12 uses extraState, not mutations)
    if (!record.extraState || typeof record.extraState !== 'object') {
      record.extraState = {};
    }
    const extra = record.extraState as Record<string, unknown>;

    // Collect SBox_ values from fields OR from _sbx_def_ (legacy deferral format)
    const source: Record<string, unknown> = { ...fields };
    const sbxDef =
      record._sbx_def_ && typeof record._sbx_def_ === 'object'
        ? (record._sbx_def_ as Record<string, unknown>)
        : null;
    if (sbxDef) {
      for (const [k, v] of Object.entries(sbxDef)) {
        if (/^SBox_\d+_\d+$/.test(k) && !(k in source)) {
          source[k] = v;
        }
      }
    }

    const sboxKeys = Object.keys(source)
      .filter((k) => /^SBox_\d+_\d+$/.test(k))
      .sort((a, b) => {
        const [, ar, ac] = a.match(/^SBox_(\d+)_(\d+)$/)!;
        const [, br, bc] = b.match(/^SBox_(\d+)_(\d+)$/)!;
        return parseInt(ar) - parseInt(br) || parseInt(ac) - parseInt(bc);
      });

    // Always clean up SBox_* from fields (even if extraState.data already exists)
    for (const k of sboxKeys) {
      delete fields[k];
      if (sbxDef) delete sbxDef[k];
    }

    if (sboxKeys.length === 0) {
      // No SBox fields to migrate, recurse and return
      for (const key of Object.keys(record)) {
        migrateSboxJsonMutateData(record[key]);
      }
      return;
    }

    // Only set data if not already present (don't overwrite existing)
    if (!('data' in extra)) {
      extra.data = sboxKeys.map((k) => String(source[k] ?? '00')).join(',');
    }
    // Also migrate row/col/output_format so loadExtraState sees the correct size.
    // Prefer the old mutations if present (which had correct dimensions),
    // otherwise fall back to fields, then defaults.
    const oldMut =
      record.mutations && typeof record.mutations === 'object'
        ? (record.mutations as Record<string, unknown>)
        : null;
    const extR = (oldMut?.row as number) || (fields.ROW as number) || 4;
    const extC = (oldMut?.col as number) || (fields.COL as number) || 4;
    const extF =
      (oldMut?.output_format as string) ||
      (fields.OUTPUT_FORMAT as string) ||
      '2d';
    extra.row = String(extR);
    extra.col = String(extC);
    extra.output_format = String(extF);
  }

  for (const key of Object.keys(record)) {
    migrateSboxJsonMutateData(record[key]);
  }
}

/**
 * crypto_sbox_def / sbox_def → sbox_variables_set 结构迁移 (JSON)
 *
 * 旧: { type: "sbox_def", inputs: { new_box: { block: ... } } }
 * 新: { type: "sbox_variables_set", fields: { VAR: { id: "..." } }, inputs: { VALUE: { block: ... } } }
 */
function migrateSboxDefJson(obj: unknown): void {
  if (Array.isArray(obj)) {
    for (const item of obj) migrateSboxDefJson(item);
    return;
  }
  if (typeof obj !== 'object' || obj === null) return;

  const record = obj as Record<string, unknown>;

  for (const key of Object.keys(record)) {
    if (key === 'variables' || key === 'blocks') continue;
    migrateSboxDefJson(record[key]);
  }

  if ('blocks' in record && Array.isArray(record.blocks)) {
    const blocks = record.blocks as Record<string, unknown>[];
    let varsMutated = false;

    const walkBlocks = (items: Record<string, unknown>[]) => {
      for (const block of items) {
        const btype = block.type;
        if (btype === 'crypto_sbox_def' || btype === 'sbox_def') {
          block.type = 'sbox_variables_set';

          if (block.inputs && typeof block.inputs === 'object') {
            const inputs = block.inputs as Record<string, unknown>;
            if (inputs.new_box !== undefined) {
              inputs.VALUE = inputs.new_box;
              delete inputs.new_box;
            }
          }

          if (!block.fields || typeof block.fields !== 'object') {
            block.fields = {};
          }
          const fields = block.fields as Record<string, unknown>;
          if (!fields.VAR) {
            const varId =
              'sbox_migrated_' +
              Date.now().toString(36) +
              '_' +
              Math.random().toString(36).slice(2, 8);
            fields.VAR = { id: varId };
            if (!record.variables) {
              record.variables = [];
            }
            (record.variables as Record<string, unknown>[]).push({
              name: 'sbox',
              id: varId,
              type: 'SBox',
            });
            varsMutated = true;
          }
        }

        if (block.inputs && typeof block.inputs === 'object') {
          for (const inputVal of Object.values(
            block.inputs as Record<string, unknown>,
          )) {
            if (
              inputVal &&
              typeof inputVal === 'object' &&
              'block' in (inputVal as Record<string, unknown>)
            ) {
              walkBlocks([
                (inputVal as Record<string, unknown>).block as Record<
                  string,
                  unknown
                >,
              ]);
            }
          }
        }
        if (
          block.next &&
          typeof block.next === 'object' &&
          'block' in (block.next as Record<string, unknown>)
        ) {
          walkBlocks([
            (block.next as Record<string, unknown>).block as Record<
              string,
              unknown
            >,
          ]);
        }
      }
    };

    walkBlocks(blocks);

    if (varsMutated && Array.isArray(record.variables)) {
      const seen = new Set<string>();
      record.variables = (record.variables as Record<string, unknown>[]).filter(
        (v) => {
          const id = v.id as string;
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        },
      );
    }
  }
}

function migrateCompoundInstrField(obj: unknown): void {
  if (Array.isArray(obj)) {
    for (const item of obj) migrateCompoundInstrField(item);
    return;
  }
  if (typeof obj !== 'object' || obj === null) return;

  const record = obj as Record<string, unknown>;

  if (
    record.type === 'lgc_compound' &&
    record.fields &&
    typeof record.fields === 'object'
  ) {
    const fields = record.fields as Record<string, unknown>;
    if (typeof fields.instr === 'string') {
      const map: Record<string, string> = {
        XOR: 'XOR_XOR',
        OR: 'OR_OR',
        AND: 'AND_AND',
      };
      fields.instr = map[fields.instr as string] || fields.instr;
    }
  }

  for (const key of Object.keys(record)) {
    migrateCompoundInstrField(record[key]);
  }
}

function migrateBitOpFieldValues(obj: unknown): void {
  if (Array.isArray(obj)) {
    for (const item of obj) migrateBitOpFieldValues(item);
    return;
  }
  if (typeof obj !== 'object' || obj === null) return;

  const record = obj as Record<string, unknown>;

  if (
    (record.type === 'crypto_bitwise_expr' ||
      record.type === 'bit_operation') &&
    record.fields &&
    typeof record.fields === 'object'
  ) {
    const fields = record.fields as Record<string, unknown>;
    const opMap: Record<string, string> = {
      ROR32: 'RIGHT_ROTATE',
      SHR32: 'RIGHT_SHIFT',
    };
    if (typeof fields.OP === 'string') {
      fields.OP = opMap[fields.OP as string] || fields.OP;
    }
  }

  for (const key of Object.keys(record)) {
    migrateBitOpFieldValues(record[key]);
  }
}

export function getMigrationMap(): Record<string, string> {
  return { ...BLOCK_TYPE_MIGRATION_MAP };
}
