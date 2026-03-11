/**
 * ATS Safe Parse (Engineering.md §7.2): file naming
 * Pattern: FirstName_LastName_Executive_Resume_2025 (or with role/company).
 */

export function getSafeExportFilename(
  firstName: string,
  lastName: string,
  suffix: string = 'Executive_Resume',
  year?: number
): string {
  const y = year ?? new Date().getFullYear();
  const first = (firstName || 'Resume').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
  const last = (lastName || '').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
  const suf = (suffix || 'Resume').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
  if (last) return `${first}_${last}_${suf}_${y}.pdf`;
  return `${first}_${suf}_${y}.pdf`;
}

/**
 * From resume header name string "FirstName LastName" and optional company/role, build filename.
 */
export function getExportFilenameFromResume(
  fullName: string,
  companyOrRole?: string
): string {
  const parts = (fullName || 'Resume').trim().split(/\s+/);
  const firstName = parts[0] ?? 'Resume';
  const lastName = parts.slice(1).join('_') || '';
  const suffix = companyOrRole
    ? companyOrRole.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'Executive_Resume'
    : 'Executive_Resume';
  return getSafeExportFilename(firstName, lastName, suffix);
}
