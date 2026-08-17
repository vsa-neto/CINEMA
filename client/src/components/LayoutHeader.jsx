import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';

function LayoutHeader() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (location.pathname === '/admin/login') {
      document.title = "авторизация";
    } else if (isAdminPath) {
      document.title = "идем в кино/ админ";
    } else {
      document.title = "идем в кино";
    }

    if (isAdminPath) {
      document.body.classList.add('AdminDashboard');
    } else {
      document.body.classList.remove('AdminDashboard');
    }

    return () => {
      document.body.classList.remove('AdminDashboard');
    };
  }, [location.pathname, isAdminPath]);

  return (
    <header className="page-header">
      <h1 className="page-header__title">
        <Link to="/" style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}>
          Идём<span>в</span>кино
        </Link>
      </h1>
      {isAdminPath && <p className="page-header__subtitle">Администраторская</p>}
    </header>
  );
}

export default LayoutHeader;