import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { Project, Status } from '../types';
import { STATUS_LIST } from '../types';
import { daysRemaining } from './dateUtils';

export interface ParseResult {
  projects: Project[];
  warnings: string[];
}

type RawRecord = Record<string, unknown>;

const FIELD_ALIASES: Record<string, string[]> = {
  projectName: ['projectname', '과제명', '프로젝트명', '업무명', 'name', 'title'],
  company: ['company', '관계사', '회사', '계열사'],
  department: ['department', '담당조직', '부서', '팀'],
  owner: ['owner', '담당자', '담당', 'manager'],
  startDate: ['startdate', '시작일', '시작날짜'],
  dueDate: ['duedate', '완료예정일', '마감일', '종료일', '완료일'],
  progress: ['progress', '진행률', '진척률', '진행율'],
  status: ['status', '상태'],
  category: ['category', '업무유형', '유형', '분류'],
  issue: ['issue', '이슈', '주요이슈', '비고', 'note'],
  weeklyChange: ['weeklychange', '지난주대비', '주간변화', '변화율', '전주대비'],
};

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/[\s_-]/g, '');
}

function getField(row: RawRecord, field: keyof typeof FIELD_ALIASES): string {
  const aliases = FIELD_ALIASES[field].map(normalizeKey);
  for (const key of Object.keys(row)) {
    if (aliases.includes(normalizeKey(key))) {
      const value = row[key];
      return value === null || value === undefined ? '' : String(value).trim();
    }
  }
  return '';
}

function parseProgress(raw: string): number {
  const cleaned = raw.replace('%', '').trim();
  const n = Number(cleaned);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function parseWeeklyChange(raw: string): number {
  const cleaned = raw.replace('%p', '').replace('%', '').replace('+', '').trim();
  const n = Number(cleaned);
  return Number.isNaN(n) ? 0 : n;
}

function parseDate(raw: string): string {
  if (!raw) return new Date().toISOString().slice(0, 10);
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function deriveStatus(raw: string, progress: number, dueDateIso: string): Status {
  const found = STATUS_LIST.find((s) => s === raw);
  if (found) return found;

  const normalized = raw.toLowerCase();
  if (['지연', 'delay', 'delayed', 'late', 'overdue'].some((k) => normalized.includes(k))) return '지연';
  if (['주의', '위험', 'warning', 'at risk', 'risk'].some((k) => normalized.includes(k))) return '주의';
  if (['정상', 'normal', 'ontrack', 'on track', 'good'].some((k) => normalized.includes(k))) return '정상';

  // no usable status text — derive a reasonable one from schedule pressure
  const remaining = daysRemaining(dueDateIso);
  if (remaining < 0 && progress < 100) return '지연';
  if (remaining <= 7 && progress < 70) return '주의';
  return '정상';
}

function mapRowToProject(row: RawRecord, index: number): Project | null {
  const projectName = getField(row, 'projectName');
  if (!projectName) return null;

  const progress = parseProgress(getField(row, 'progress'));
  const startDate = parseDate(getField(row, 'startDate'));
  const dueDate = parseDate(getField(row, 'dueDate'));
  const statusRaw = getField(row, 'status');

  return {
    id: `upload-${index + 1}`,
    projectName,
    company: getField(row, 'company') || '미지정',
    department: getField(row, 'department') || '미지정',
    owner: getField(row, 'owner') || '미지정',
    startDate,
    dueDate,
    progress,
    status: deriveStatus(statusRaw, progress, dueDate),
    category: getField(row, 'category') || '기타',
    issue: getField(row, 'issue'),
    weeklyChange: parseWeeklyChange(getField(row, 'weeklyChange')),
  };
}

function rowsToProjects(rows: RawRecord[]): ParseResult {
  const warnings: string[] = [];
  const projects = rows
    .map((row, i) => mapRowToProject(row, i))
    .filter((p): p is Project => p !== null);

  if (projects.length === 0) {
    warnings.push('과제명 컬럼을 찾을 수 없어 데이터를 읽지 못했습니다.');
  } else if (projects.length < rows.length) {
    warnings.push(`${rows.length - projects.length}개 행은 과제명이 없어 제외되었습니다.`);
  }

  return { projects, warnings };
}

function parseCsv(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<RawRecord>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => resolve(rowsToProjects(result.data)),
      error: (err) => reject(err),
    });
  });
}

async function parseExcel(file: File): Promise<ParseResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return { projects: [], warnings: ['시트를 찾을 수 없습니다.'] };
  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<RawRecord>(sheet, { defval: '' });
  return rowsToProjects(rows);
}

export async function parseProjectFile(file: File): Promise<ParseResult> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.csv')) return parseCsv(file);
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) return parseExcel(file);
  throw new Error('지원하지 않는 파일 형식입니다. Excel(.xlsx) 또는 CSV 파일을 올려주세요.');
}
