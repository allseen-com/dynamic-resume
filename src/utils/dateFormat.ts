/**
 * ATS Safe Parse (Engineering.md §4.3, §7.2): dates must be MM/YYYY only.
 * No apostrophes ('23), seasons (Summer 2023), or ambiguous formats.
 */

const MM_YYYY = /^(0[1-9]|1[0-2])\/(19|20)\d{2}$/;
const MONTH_NAMES: Record<string, string> = {
  january: '01', jan: '01',
  february: '02', feb: '02',
  march: '03', mar: '03',
  april: '04', apr: '04',
  may: '05',
  june: '06', jun: '06',
  july: '07', jul: '07',
  august: '08', aug: '08',
  september: '09', sep: '09', sept: '09',
  october: '10', oct: '10',
  november: '11', nov: '11',
  december: '12', dec: '12',
};

/**
 * Normalize a date string to MM/YYYY. Returns the original if already valid, or a best-effort conversion.
 */
export function normalizeToMMYYYY(input: string): string {
  const raw = (input || '').trim();
  if (!raw) return raw;

  // Already MM/YYYY
  const simple = raw.replace(/\s*–\s*|\s*-\s*|\s+to\s+/gi, '–').split('–')[0].trim();
  if (MM_YYYY.test(simple)) return simple;

  // Apostrophe year:  '21 -> 2021, '23 -> 2023
  const apostrophe = raw.match(/^(\d{1,2})\/?\'(\d{2})$/i) ?? raw.match(/(\d{1,2})\/?\'(\d{2})/);
  if (apostrophe) {
    const mm = apostrophe[1].padStart(2, '0');
    const yy = apostrophe[2];
    const yyyy = parseInt(yy, 10) >= 50 ? `19${yy}` : `20${yy}`;
    return `${mm}/${yyyy}`;
  }

  // "Summer 2023", "June 2021", "Jan 2020"
  const monthYear = raw.match(/(\w+)\s+(\d{4})/i);
  if (monthYear) {
    const month = MONTH_NAMES[monthYear[1].toLowerCase()];
    if (month) return `${month}/${monthYear[2]}`;
  }

  // "06/2021" or "6/2021"
  const slash = raw.match(/^(\d{1,2})\/(\d{4})$/);
  if (slash) {
    const mm = slash[1].padStart(2, '0');
    return `${mm}/${slash[2]}`;
  }

  return raw;
}

/**
 * Normalize all date ranges in resume data (header stays unchanged; experience and education dateRange fields).
 */
export function normalizeResumeDates<T extends { dateRange?: string; professionalExperience?: { dateRange?: string }[]; education?: { value?: { dateRange?: string }[] } }>(data: T): T {
  const out = JSON.parse(JSON.stringify(data)) as T;
  if (out.professionalExperience?.length) {
    out.professionalExperience = out.professionalExperience.map((exp) => ({
      ...exp,
      dateRange: exp.dateRange ? normalizeToMMYYYY(exp.dateRange) : exp.dateRange,
    }));
  }
  if (out.education?.value?.length) {
    out.education = {
      ...out.education,
      value: out.education.value.map((e) => ({
        ...e,
        dateRange: e.dateRange ? normalizeToMMYYYY(e.dateRange) : e.dateRange,
      })),
    };
  }
  return out;
}
