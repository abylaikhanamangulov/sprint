import 'styled-components';
import type { AppTheme } from './theme';

declare module 'styled-components' {
  // Make props.theme fully typed across the app (no `any`).
  export interface DefaultTheme extends AppTheme {}
}
