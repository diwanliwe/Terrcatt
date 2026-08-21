/** Shared type & spacing scale for the results screens — keep it small. */
export const ink = '#2B2B2B';
export const muted = '#8A8580';
export const accent = '#C4956A';
export const surface = '#FFFFFF';

export const type = {
  title: { fontSize: 24, lineHeight: 32, fontWeight: '700' as const, color: ink },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const, color: muted },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '600' as const, color: ink },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const, color: muted },
};

export const space = { xs: 8, sm: 16, md: 24, lg: 32 };
