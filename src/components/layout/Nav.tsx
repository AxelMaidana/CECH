import React, { useState, useEffect } from 'react';
import { Menu, ChevronDown, ChevronRight } from 'lucide-react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/client';

type MenuItem = {
  id: string;
  title: string;
  path: string;
  parentId: string | null;
};

export default function UserMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenusDesktop, setOpenSubmenusDesktop] = useState<{ [key: string]: boolean }>({});
  const [openSubmenusMobile, setOpenSubmenusMobile] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const q = query(collection(db, 'menu'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: MenuItem[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as MenuItem);
      });
      setMenuItems(items);
    });

    return () => unsubscribe();
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const toggleSubmenuMobile = (id: string) => {
    setOpenSubmenusMobile(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSubmenuDesktop = (id: string) => {
    setOpenSubmenusDesktop(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getChildItems = (parentId: string | null) => {
    return menuItems.filter(item => item.parentId === parentId);
  };

  const renderMenuItem = (item: MenuItem, depth: number = 0, index: number) => {
    const children = getChildItems(item.id);
    const isSubmenuOpenMobile = openSubmenusMobile[item.id];
    const isSubmenuOpenDesktop = openSubmenusDesktop[item.id];
    const isFirst = index === 0;
    const isLast = index === menuItems.length - 1;

    return (
      <li key={item.id} className={`relative ${depth === 0 ? 'group' : ''} 
        ${window.innerWidth >= 1024 ? 
          `border-l border-l-customBlack border-opacity-30 ${isFirst ? 'border-l-0' : ''} ${isLast ? 'border-r-0' : ''}` 
          : ''} 
        ${depth === 0 && window.innerWidth < 1024 ? 'border-b border-b-customBlack border-opacity-30 py-2' : ''}`}>
        <div className="flex items-center justify-between w-full">
          <a
            href={`/${item.path.replace(/\//g, '-')}`}
            className={`flex items-center justify-center w-full text-white text-xs py-1 px-4 hover:underline transform hover:scale-105 transition-transform duration-100 ${depth === 0 ? 'text-center' : ''} ${window.innerWidth >= 1024 ? 'text-center' : ''}`}
          >
            {item.title}
          </a>
          {children.length > 0 && (
            <button
              onClick={() => {
                if (window.innerWidth < 1024) {
                  toggleSubmenuMobile(item.id);
                } else {
                  toggleSubmenuDesktop(item.id);
                }
              }}
              className="ml-2 text-white"
            >
              {isSubmenuOpenMobile || isSubmenuOpenDesktop ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Submenú para Móvil */}
        {children.length > 0 && isSubmenuOpenMobile && (
          <div className="lg:hidden mt-2 pl-4 bg-[#46b424] p-2 text-start shadow-inner shadow-[#2b3a2a]">
            <ul>
              {children.map(child => renderMenuItem(child, depth + 1, 0))}
            </ul>
          </div>
        )}

        {/* Submenú para Escritorio */}
        {children.length > 0 && (isSubmenuOpenDesktop || window.innerWidth >= 1024) && (
          <div className="lg:block absolute left-0 top-full mt-2 w-48 bg-[#46b424] rounded-md 
            opacity-0 group-hover:opacity-100 transition-opacity duration-200 
            shadow-inner shadow-[#2b3a2a]">
            <ul>
              {children.map(child => renderMenuItem(child, depth + 1, 0))}
            </ul>
          </div>
        )}
      </li>
    );
  };

  return (
    <nav className="bg-customGreen text-sm font-bold flex self-end lg:self-auto lg:justify-center lg:items-center rounded-l-xl lg:rounded-none lg:rounded-b-xl shadow-lg w-8 lg:w-full z-40 relative">
      <div className="container mx-auto py-1 flex justify-center items-center">
        <button
          className="block lg:hidden text-white focus:outline-none"
          onClick={toggleMenu}
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Menú de escritorio con espaciado uniforme */}
        <ul className="hidden lg:flex lg:justify-center lg:items-center text-center lg:w-full text-white space-x-4 xl:gap-x-10">
          {menuItems.filter(item => item.parentId === null).map((item, index) => renderMenuItem(item, 0, index))}
        </ul>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleMenu} />
      )}

      <div
        className={`fixed top-0 right-0 h-screen bg-customGreen w-full max-w-[300px] shadow-lg transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-40 rounded-l-2xl overflow-y-auto`}
      >
        <button
          className="absolute top-4 right-4 text-white text-3xl"
          onClick={toggleMenu}
        >
          &times;
        </button>
        <ul className="mt-16 text-white space-y-1">
          {menuItems.filter(item => item.parentId === null).map((item, index) => renderMenuItem(item, 0, index))}
        </ul>
      </div>
    </nav>
  );
}
