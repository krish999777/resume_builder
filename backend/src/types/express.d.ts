// Source - https://stackoverflow.com/a/40762463
// Posted by maximilianvp, modified by community. See post 'Timeline' for change history
// Retrieved 2026-06-17, License - CC BY-SA 4.0

declare namespace Express {
   export interface Request {
      id?: number,
      role?: 'candidate'|'recruiter'
   }
}
