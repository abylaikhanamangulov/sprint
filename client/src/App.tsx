import { BrowserRouter } from 'react-router-dom';
import { renderRoutes } from './routes/renderRoutes';
import { routes } from './routes/routes';
import { useAppViewModel } from './AppViewModel';
import { AppShell } from './views/AppShell';
import { SplashLoader } from './views/ui';
import { WelcomeView } from './components/pages/Welcome/Welcome';

function App() {
  const { stage, finishOnboarding } = useAppViewModel();

  const renderInitContent = () => {
    if (stage === 'loading') {
      return <SplashLoader />;
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
