import styled from 'styled-components';

/**
 * Responsive app container.
 * - Mobile / Telegram: full-bleed column, the fixed bottom nav pins to the
 *   viewport (no transformed ancestor).
 * - Desktop (≥600px): a centred "phone frame" — capped width & height with
 *   rounded corners. `transform: translateZ(0)` turns the shell into the
 *   containing block for position:fixed children (nav, overlays) so they stay
 *   inside the frame instead of spanning the whole desktop window.
 */
export const AppShell = styled.div`
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  position: relative;
  background: ${({ theme }) => theme.colors.bgPrimary};

  @media (min-width: 600px) {
    width: 430px;
    height: calc(100dvh - 24px);
    max-height: 920px;
    margin: 0 auto;
    border-radius: 26px;
    overflow: hidden;
    border: 1px solid ${({ theme }) => theme.colors.border};
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.04);
    transform: translateZ(0);
  }
`;

export const AppMain = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;

  /* On the desktop frame the shell has a definite height, so the content area
     scrolls inside it. On mobile the body scrolls naturally and the nav is fixed
     to the viewport. */
  @media (min-width: 600px) {
    min-height: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
`;
