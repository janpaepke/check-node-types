export interface CheckResult {
  status: 'pass' | 'fail' | 'warn';
  enginesNode: {
    raw: string | null;
    minMajor: number | null;
  };
  typesNode: {
    raw: string | null;
    major: number | null;
    location: 'devDependencies' | 'dependencies' | null;
  };
  message: string;
  fix: string | null;
}

export interface CliOptions {
  path: string;
  json: boolean;
  verbose: boolean;
  color: boolean;
}
