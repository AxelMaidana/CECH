'use client'

import React, { useState, useEffect } from 'react'
import { Menu, ChevronDown, ChevronRight } from 'lucide-react'
import { collection, query, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase/client'
import './submenu.css'

type MenuItem = {
  id: string
  title: string
  path: string
  parentId: string | null
  pathAttachment?: string
}

export default function Component() {
  const [isLoading, setIsLoading] = useState(true)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [openMobileMenus, setOpenMobileMenus] = useState<string[]>([])

  useEffect(() => {
    const q = query(collection(db, 'menu'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: MenuItem[] = []
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as MenuItem)
      })
      setMenuItems(items)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const getChildItems = (parentId: string | null) => {
    return menuItems.filter(item => item.parentId === parentId)
  }

  const toggleMobileSubmenu = (itemId: string) => {
    setOpenMobileMenus((prev) =>
      prev.includes(itemId) 
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    )
  }

  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const children = getChildItems(item.id)
  
    return (
      <li key={item.id} className={`relative group ${depth === 0 ? 'flex-grow text-center border-r border-black border-opacity-20 last:border-0' : ''}`}>
        {children.length > 0 ? (
          <span className={`block transform hover:scale-105 hover:underline transition-transform duration-100 ${depth === 0 ? 'text-white' : 'text-white'} text-xs whitespace-nowrap 2xl:text-sm py-1 px-2 cursor-pointer`}>
            {item.title}
            {depth === 0 ? <ChevronDown className="inline-block w-4 h-4 ml-1" /> : <ChevronRight className="inline-block w-4 h-4 ml-1" />}
          </span>
        ) : (
          <div className={`${depth === 0 ? '' : 'submenu-item my-2'}`}>
            <a href={`/${item.path.replace(/\//g, '-')}`} className={`block transform hover:scale-105 hover:underline transition-transform duration-100 ${depth === 0 ? 'text-white' : 'text-white'} text-xs whitespace-nowrap 2xl:text-sm py-1 px-2`}>
              {item.title}
            </a>
          </div>
        )}
        
        {children.length > 0 && (
          <ul className={`absolute text-start p-4 ${depth === 0 ? 'left-0 top-full' : 'left-full top-0'} mt-2 w-48 rounded-md shadow-lg bg-customGreen ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10`}>
            {children.map(child => renderMenuItem(child, depth + 1))}
          </ul>
        )}
      </li>
    )
  }

  const renderMobileMenuItem = (item: MenuItem, depth: number = 0) => {
    const children = getChildItems(item.id)
    const isOpen = openMobileMenus.includes(item.id)

    return (
      <li key={item.id} className={`w-full ${depth === 0 ? 'border-b border-black border-opacity-20' : ''}`}>
        <div className="flex items-center justify-between px-2 py-3 transition-all duration-300 ease-in-out hover:shadow-lg">
          <a
            href={`/${item.path.replace(/\//g, '-')}`}
            className={`flex-grow px-4 ${depth === 0 ? 'font-semibold text-white' : 'text-white'}`}
            onClick={toggleMenu}
          >
            {item.title}
          </a>
          {children.length > 0 && (
            <button
              onClick={(e) => {
                e.preventDefault()
                toggleMobileSubmenu(item.id)
              }}
              className="p-2"
            >
              <ChevronDown
                className={`w-5 h-5 text-white transition-transform duration-300 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          )}
        </div>
        {children.length > 0 && isOpen && (
          <ul className="pl-4 mb-2">
            {children.map((child) => renderMobileMenuItem(child, depth + 1))}
          </ul>
        )}
      </li>
    )
  }

  const renderSkeletonMenuItem = (depth: number = 0) => (
    <li key={`skeleton-${depth}`} className={`relative ${depth === 0 ? 'flex-grow text-center border-r border-black border-opacity-20 last:border-0' : ''}`}>
      <div className={`h-6 bg-customGreen rounded ${depth === 0 ? 'mx-2' : 'mx-4 my-2'}`}></div>
    </li>
  )

  if (isLoading) {
    return (
      <nav className="bg-customGreen text-sm font-bold flex self-end lg:self-auto lg:justify-center lg:items-center rounded-l-xl lg:rounded-none lg:rounded-b-xl shadow-lg w-8 lg:w-full z-auto relative">
        <div className="container mx-auto py-1 flex justify-center items-center">
          <div className="block lg:hidden w-6 h-6 bg-customGreen rounded"></div>
          <ul className="hidden lg:flex lg:flex-row lg:w-full">
            {[...Array(5)].map((_, index) => renderSkeletonMenuItem(index))}
          </ul>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-customGreen text-sm font-bold flex self-end lg:self-auto lg:justify-center lg:items-center rounded-l-xl lg:rounded-none lg:rounded-b-xl shadow-lg w-8 lg:w-full z-auto relative">
      <div className="container mx-auto py-1 flex justify-center items-center">
        <button
          className="block lg:hidden text-white focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Desktop Menu */}
        <ul className="hidden lg:flex lg:flex-row lg:w-full">
          {menuItems.filter(item => item.parentId === null).map(item => renderMenuItem(item))}
        </ul>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleMenu} />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 h-screen bg-customGreen w-full max-w-[300px] shadow-lg transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-300 ease-in-out z-50 rounded-l-2xl overflow-y-auto lg:hidden`}
      >
        <button
          className="absolute top-4 right-4 text-white text-3xl"
          onClick={toggleMenu}
          aria-label="Close menu"
        >
          &times;
        </button>
        <ul className="mt-16 text-white space-y-1">
          {menuItems.filter(item => item.parentId === null).map(item => renderMobileMenuItem(item))}
        </ul>
      </div>
    </nav>
  )
}