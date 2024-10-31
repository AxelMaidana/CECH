import React, { useState, useEffect } from 'react';

const menuItems = [
  { href: '/institucional', text: 'INSTITUCIONAL', icon: 'buildings' },
  { href: '/dictamenes', text: 'DICTÁMENES', icon: 'clipboard-text' },
  { href: '/matriculados', text: 'MATRICULADOS ACTIVOS', icon: 'user-share' },
  { href: '/novedades', text: 'NOVEDADES', icon: 'news' },
  { href: '/nombramientos', text: 'NOMBRAMIENTOS', icon: 'license' },
  { href: '/tramites', text: 'TRÁMITES', icon: 'box' },
  { href: '/becas', text: 'BECAS', icon: 'school' },
  { href: '/cursos', text: 'ACT. ACADÉMICAS', icon: 'activity' },
  { href: '/contacto', text: 'CONTACTO', icon: 'user' },
];

const Icon = ({ name }) => {
  switch (name) {
    case 'buildings':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 21v-15c0 -1 1 -2 2 -2h5c1 0 2 1 2 2v15" /><path d="M16 8h2c1 0 2 1 2 2v11" /><path d="M3 21h18" /><path d="M10 12v0" /><path d="M10 16v0" /><path d="M10 8v0" /><path d="M7 12v0" /><path d="M7 16v0" /><path d="M7 8v0" /><path d="M17 12v0" /><path d="M17 16v0" />
        </svg>
      );
    case 'clipboard-text':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" /><path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" /><path d="M9 12h6" /><path d="M9 16h6" />
        </svg>
      );
    case 'user-share':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /><path d="M6 21v-2a4 4 0 0 1 4 -4h3" /><path d="M16 22l5 -5" /><path d="M21 21.5v-4.5h-4.5" />
        </svg>
      );
    case 'news':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M16 6h3a1 1 0 0 1 1 1v11a2 2 0 0 1 -4 0v-13a1 1 0 0 0 -1 -1h-10a1 1 0 0 0 -1 1v12a3 3 0 0 0 3 3h11" /><path d="M8 8l4 0" /><path d="M8 12l4 0" /><path d="M8 16l4 0" />
        </svg>
      );
    case 'license':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 21h-9a3 3 0 0 1 -3 -3v-1h10v2a2 2 0 0 0 4 0v-14a2 2 0 1 1 2 2h-2m2 -4h-11a3 3 0 0 0 -3 3v11" /><path d="M9 7l4 0" /><path d="M9 11l4 0" />
        </svg>
      );
    case 'box':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" /><path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" /><path d="M9 12v-1h6v1" /><path d="M12 11v6" /><path d="M11 17h2" />
        </svg>
      );
    case 'school':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M22 9l-10 -4l-10 4l10 4l10 -4v6" /><path d="M6 10.6v5.4a6 3 0 0 0 12 0v-5.4" />
        </svg>
      );
    case 'activity':
      return (
        <svg data-testid="geist-icon" className="h-6 w-6 mr-3" strokeLinejoin="round" viewBox="0 0 16 16" style={{ color: 'currentcolor' }}>
          <circle cx="13.5" cy="2.5" r="2.5" fill="white"></circle>
          <path fillRule="evenodd" clipRule="evenodd" d="M10.0351 4.5H2V6H4.67148C5.89632 6 6.83343 7.09104 6.64857 8.30185L6.43 9.73346C6.3381 10.2159 6.1906 10.6874 6 11.1401L4.33 15.2L5.92164 15.888L7.594 11.9162C7.72668 11.6011 8.27332 11.6011 8.406 11.9162L10.0784 15.888L11.67 15.2L10 11.1401C9.8094 10.6874 9.6619 10.2159 9.57 9.73346L9.2835 8.42904C9.00946 7.18131 9.95947 6 11.2369 6H11.562C10.9272 5.64775 10.3983 5.12781 10.0351 4.5ZM9.5 1.5C9.5 2.32843 8.82843 3 8 3C7.17157 3 6.5 2.32843 6.5 1.5C6.5 0.671573 7.17157 0 8 0C8.82843 0 9.5 0.671573 9.5 1.5Z" fill="currentColor"></path>
        </svg>
      );
    case 'user':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 2a5 5 0 1 1 -5 5l.005 -.217a5 5 0 0 1 4.995 -4.783z" /><path d="M14 14a5 5 0 0 1 5 5v1a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-1a5 5 0 0 1 5 -5h4z" />
        </svg>
      );
    default:
      return null;
  }
};

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-customGreen text-sm font-bold flex self-end md:justify-center lg:items-center rounded-l-xl lg:rounded-none lg:rounded-b-xl shadow-lg w-8 lg:w-full z-40 relative md:relative">
      <div className="container mx-auto py-1 flex justify-center items-center">
        <button
          className="block lg:hidden text-white focus:outline-none"
          onClick={toggleMenu}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        </button>

        <ul className="hidden lg:flex lg:justify-between lg:w-full text-white space-x-1">
          {menuItems.map((item, index) => (
            <li key={index} className="flex-grow text-center border-r border-black border-opacity-20 last:border-0">
              <a href={item.href}>
                <div className="block transform hover:scale-105 hover:underline transition-transform duration-100 text-white text-xs whitespace-nowrap 2xl:text-sm py-1 px-2">
                  {item.text}
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div
        className={`fixed top-0 right-0 h-screen bg-customGreen w-full max-w-[300px] shadow-lg transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-300 ease-in-out z-50 rounded-l-2xl`}
      >
        <button
          className="absolute top-4 right-4 text-white text-3xl"
          onClick={toggleMenu}
        >
          &times;
        </button>
        <ul className="mt-16 text-white space-y-1">
          {menuItems.map((item, index) => (
            <li key={index}>
              <a href={item.href}>
                <div
                  className="flex items-center m-4 py-4 px-6 hover:bg-green-300 rounded-lg hover:scale-105 transition-all duration-300 ease-in-out"
                  onClick={toggleMenu}
                >
                  <Icon name={item.icon} />
                  {item.text}
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}