/** @type {Record<string, string>} */
export const baseTypeMap = {
  String: 'String',
  Boolean: 'Boolean',
  LocalDateTime: 'String',
  MultipartFile: 'File',
  int: 'Number',
  Integer: 'Number',
  Long: 'Number',
  Double: 'Number',
  Float: 'Number',
};

/**
 * @param {string} name
 * @returns {string | undefined}
 */
export function resolveBaseType(name) {
  return baseTypeMap[name];
}
