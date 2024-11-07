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

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const getChildItems = (parentId: string | null) => {
    return menuItems.filter(item => item.parentId === parentId);
  };

  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const children = getChildItems(item.id);
    
    return (
      <li key={item.id} className={`relative group ${depth === 0 ? 'flex-grow text-center border-r border-black border-opacity-20 last:border-0' : ''}`}>
        <a href={`/${item.path.replace(/\//g, '-')}`} className={`block transform hover:scale-105 hover:underline transition-transform duration-100 ${depth === 0 ? 'text-white' : 'text-white'} text-xs whitespace-nowrap 2xl:text-sm py-1 px-4`}>
          {item.title}
          {children.length > 0 && (depth === 0 ? <ChevronDown className="inline-block w-4 h-4 ml-1" /> : <ChevronRight className="inline-block w-4 h-4 ml-1" />)}
        </a>
        {children.length > 0 && (
          <div className={`absolute ${depth === 0 ? 'left-0 top-full' : 'left-full top-0'} mt-2 w-48 rounded-md shadow-lg bg-customGreen ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10`}>
            <ul className="py-1">
              {children.map(child => renderMenuItem(child, depth + 1))}
            </ul>
          </div>
        )}
      </li>
    );
  };

  return (
    <nav className="bg-customGreen text-sm font-bold flex self-end md:justify-center md:items-center rounded-l-xl md:rounded-none md:rounded-b-xl shadow-lg w-8 md:w-full z-40 relative">
      <div className="container mx-auto py-1 flex justify-center items-center px-6 max-w-full">
        <button
          className="block md:hidden text-white focus:outline-none"
          onClick={toggleMenu}
        >
          <Menu className="w-6 h-6" />
        </button>

        <ul className="hidden md:flex md:justify-between md:w-full text-white space-x-4">
          {menuItems.filter(item => item.parentId === null).map(item => renderMenuItem(item))}
        </ul>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleMenu} />
      )}

      <div
        className={`fixed top-0 right-0 h-screen bg-customGreen w-full max-w-[300px] shadow-lg transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-50 rounded-l-2xl overflow-y-auto`}
      >
        <button
          className="absolute top-4 right-4 text-white text-3xl"
          onClick={toggleMenu}
        >
          &times;
        </button>
        <ul className="mt-16 text-white space-y-1">
          {menuItems.filter(item => item.parentId === null).map(item => renderMenuItem(item))}
        </ul>
      </div>
    </nav>
  );
}
