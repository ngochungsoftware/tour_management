import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children?: ReactNode;
}

const Layout = ({ children }: LayoutProps) => (
  <div className="flex min-h-screen flex-col bg-slate-50">
    <Header />
    <main className="flex-1">
      {children ?? <Outlet />}
    </main>
    <Footer />
  </div>
);

export default Layout;
