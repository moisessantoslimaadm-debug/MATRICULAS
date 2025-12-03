import React, { useState, useEffect, createContext, useContext } from 'react';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Registration } from './pages/Registration';
import { SchoolList } from './pages/SchoolList';
import { Status } from './pages/Status';
import { AdminData } from './pages/AdminData';
import { ChatAssistant } from './components/ChatAssistant';

// --- Simple Router Replacement for missing react-router-dom ---

const RouterContext = createContext<{ path: string; navigate: (path: string) => void }>({
  path: window.location.hash.slice(1) || '/',
  navigate: () => {},
});

export function useLocation() {
  const { path } = useContext(RouterContext);
  const [pathname, search] = path.split('?');
  return { pathname, search: search ? `?${search}` : '' };
}

export function useNavigate() {
  const { navigate } = useContext(RouterContext);
  return navigate;
}

export function useSearchParams() {
  const { search } = useLocation();
  return [new URLSearchParams(search)];
}

export function Link({ to, children, className, onClick, ...props }: any) {
  const { navigate } = useContext(RouterContext);
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) onClick(e);
    e.preventDefault();
    navigate(to);
  };
  return (
    <a href={`#${to}`} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
}

export function Routes({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  let match = null;
  
  React.Children.forEach(children, (child) => {
    if (match) return;
    if (React.isValidElement(child)) {
      const { path, element } = child.props as any;
      if (path === pathname) {
        match = element;
      }
    }
  });
  
  return <>{match}</>;
}

export function Route({ path, element }: { path: string; element: React.ReactNode }) {
  return null;
}

export function HashRouter({ children }: { children: React.ReactNode }) {
  const [path, setPath] = useState(window.location.hash.slice(1) || '/');

  useEffect(() => {
    const handleHashChange = () => {
      setPath(window.location.hash.slice(1) || '/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (newPath: string) => {
    window.location.hash = newPath;
  };

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}
// -----------------------------------------------------------

const Footer: React.FC = () => (
  <footer className="bg-slate-900 text-slate-400 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
      <div>
        <h4 className="text-white font-bold text-lg mb-4">EducaMunicípio</h4>
        <p className="text-sm">
          Transformando a educação pública através da tecnologia e acessibilidade.
        </p>
      </div>
      <div>
        <h4 className="text-white font-bold mb-4">Links Rápidos</h4>
        <ul className="space-y-2 text-sm">
          <li><a href="#" className="hover:text-white transition">Portal da Transparência</a></li>
          <li><a href="#" className="hover:text-white transition">Calendário Escolar</a></li>
          <li><a href="#" className="hover:text-white transition">Cardápio da Merenda</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-bold mb-4">Contato</h4>
        <ul className="space-y-2 text-sm">
          <li>Central: 156</li>
          <li>Email: contato@educacao.gov.br</li>
          <li>Av. Educação, 1000 - Centro</li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-bold mb-4">Horário de Atendimento</h4>
        <p className="text-sm">
          Segunda a Sexta<br/>
          08:00 às 17:00
        </p>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-center text-xs">
      &copy; {new Date().getFullYear()} Secretaria Municipal de Educação. Todos os direitos reservados.
    </div>
  </footer>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const App: React.FC = () => {
  return (
    <HashRouter>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/schools" element={<SchoolList />} />
            <Route path="/status" element={<Status />} />
            <Route path="/admin/data" element={<AdminData />} />
          </Routes>
        </main>
        <Footer />
        <ChatAssistant />
      </div>
    </HashRouter>
  );
};

export default App;