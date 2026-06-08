import { BrowserRouter } from 'react-router-dom';
import { renderRoutes } from './routes/renderRoutes';
import { routes } from './routes/routes';
import { useAppViewModel } from './viewmodels/useAppViewModel';
import { AppShell } from './views/AppShell';
import { Loader } from './views/ui';
import { WelcomeView } from './components/pages/Welcome/Welcome';

function App() {
  const { stage, finishOnboarding } = useAppViewModel();

  const renderInitContent = () => {
    if (stage === 'loading') {
      return <Loader />;
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
