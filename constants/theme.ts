export const theme = {
  colors: {
    background: '#0B0D11', surface: '#151820', elevated: '#1C212B', border: '#2B313C',
    primary: '#B9FF67', primaryTint: '#202E1B', violet: '#A78BFA', violetTint: '#28223A',
    text: '#F4F4F5', muted: '#A3ABB8', subtle: '#738092', danger: '#FF9292',
    dangerTint: '#352027', success: '#B9FF67', cyan: '#7DD3FC', amber: '#FCD58A',
    overlay: 'rgba(0,0,0,0.75)', transparent: 'transparent',
  },
  space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  radius: { sm: 8, md: 16, lg: 24, pill: 99 },
  font: { small: 12, label: 14, body: 16, section: 20, title: 28, hero: 40 },
};
export const typeColors: Record<string, string> = {
  idea: theme.colors.primary, note: theme.colors.cyan, source: theme.colors.amber,
  skill: theme.colors.violet, concept: theme.colors.primary, question: theme.colors.danger,
};
