import { BrowserRouter } from 'react-router-dom';
import { renderRoutes } from './routes/renderRoutes';
import { routes } from './routes/routes';
import { useAppViewModel } from './viewmodels/useAppViewModel';
import { AppShell } from './views/AppShell';
import { Spinner, CenteredFill } from './views/ui';
import { SplashView } from './views/screens/SplashView';
import { WelcomeView } from './views/screens/WelcomeView';

function App() {
  const { stage, finishSplash, finishOnboarding } = useAppViewModel();

  const renderInitContent = () => {
    if (stage === 'splash') return <SplashView onDone={finishSplash} />;
    if (stage === 'loading') {
      return (
        <CenteredFill>
          <Spinner />
        </CenteredFill>
      );
    }
    if (stage === 'welcome') return <WelcomeView onDone={finishOnboarding} />;
    
    return null;
  };

  const initContent = renderInitContent();

  return (
    <AppShell>
      {initContent ? (
        initContent
      ) : (
        <BrowserRouter>
          {renderRoutes(routes)}
        </BrowserRouter>
      )}
    </AppShell>
  );
}

export default App;
