import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: ${({ theme }) => theme.colors.bgPrimary};
    color: ${({ theme }) => theme.colors.textPrimary};
    min-height: 100vh;
    min-height: 100dvh;
    overflow-x: hidden;
    overscroll-behavior: none;
    -webkit-font-smoothing: antialiased;
    -webkit-tap-highlight-color: transparent;
  }

  #root {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }

  /* Desktop: show the mobile app inside a centred phone frame with a backdrop. */
  @media (min-width: 600px) {
    body {
      background: radial-gradient(circle at 50% -10%, #161d38 0%, #070912 65%);
    }
    #root {
      align-items: center;
      justify-content: center;
    }
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    font-family: inherit;
    transition: all 0.2s;
  }

  button:active {
    transform: scale(0.96);
  }

  input, select, textarea {
    font-family: inherit;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
