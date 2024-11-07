'use client'

import React, { useState, useEffect } from 'react'
import { Menu, Plus, Edit2, Check, ChevronDown, ChevronRight, Trash2 } from 'lucide-react'
import { collection, query, onSnapshot, setDoc, doc, deleteDoc, getDocs, where, getDoc } from 'firebase/firestore'
import { db } from '../../firebase/client'

type MenuItem = {
  id: string
  title: string
  path: string
  parentId: string | null
  pathAttachment?: string
}

const Icon = ({ name }: { name: string }) => {
  switch (name) {
    case 'activity':
      return (
        <svg data-testid="geist-icon" className="h-6 w-6 mr-3" strokeLinejoin="round" viewBox="0 0 16 16" style={{ color: 'currentcolor' }}>
          <circle cx="13.5" cy="2.5" r="2.5" fill="white"></circle>
          <path fillRule="evenodd" clipRule="evenodd" d="M10.0351 4.5H2V6H4.67148C5.89632 6 6.83343 7.09104 6.64857 8.30185L6.43 9.73346C6.3381 10.2159 6.1906 10.6874 6 11.1401L4.33 15.2L5.92164 15.888L7.594 11.9162C7.72668 11.6011 8.27332 11.6011 8.406 11.9162L10.0784 15.888L11.67 15.2L10 11.1401C9.8094 10.6874 9.6619 10.2159 9.57 9.73346L9.2835 8.42904C9.00946 7.18131 9.95947 6 11.2369 6H11.562C10.9272 5.64775 10.3983 5.12781 10.0351 4.5ZM9.5 1.5C9.5 2.32843 8.82843 3 8 3C7.17157 3 6.5 2.32843 6.5 1.5C6.5 0.671573 7.17157 0 8 0C8.82843 0 9.5 0.671573 9.5 1.5Z" fill="currentColor"></path>
        </svg>
      )
    default:
      return null
  }
}

export default function Component() {
  const [isLoading, setIsLoading] = useState(true)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [showAddForm, setShowAddForm] = useState<string | null>(null)
  const [newPageTitle, setNewPageTitle] = useState('')
  const [editingPageId, setEditingPageId] = useState<string | null>(null)
  const [editedTitle, setEditedTitle] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    const q = query(collection(db, 'menu'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: MenuItem[] = []
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as MenuItem)
      })
      setMenuItems(items)
      setIsLoading(false) // Termina la carga una vez que se tienen los datos 
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 894) {
        setIsOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const addNewPage = async (parentId: string | null) => {
    if (!newPageTitle.trim()) return
    
    const path = newPageTitle.toLowerCase().replace(/\s+/g, '-')
    const id = parentId ? `${parentId}-${path}` : path
    const newItem: MenuItem = {
      id,
      title: newPageTitle,
      path: parentId ? `${parentId}/${path}` : path,
      parentId,
      pathAttachment: `snippet-${id}.txt`
    }

    try {
      await setDoc(doc(db, 'menu', id), newItem)
      await setDoc(doc(db, 'pages', id), { content: '' })
      setNewPageTitle('')
      setShowAddForm(null)
    } catch (error) {
      console.error('Error adding new page:', error)
    }
  }

  const updatePageTitle = async (pageId: string) => {
    if (!editedTitle.trim()) return
    try {
      const updatedItem = menuItems.find(item => item.id === pageId)
      if (!updatedItem) return

      const newPath = editedTitle.toLowerCase().replace(/\s+/g, '-')
      const newId = updatedItem.parentId ? `${updatedItem.parentId}-${newPath}` : newPath
      const newPathAttachment = `snippet-${newId}.txt`
      const newFullPath = updatedItem.parentId ? `${updatedItem.parentId}/${newPath}` : newPath

      // Get the content of the old page
      const oldPageDoc = await getDoc(doc(db, 'pages', pageId))
      const oldPageContent = oldPageDoc.exists() ? oldPageDoc.data().content : ''

      // Update the menu item
      await setDoc(doc(db, 'menu', newId), {
        id: newId,
        title: editedTitle,
        path: newFullPath,
        parentId: updatedItem.parentId,
        pathAttachment: newPathAttachment
      })

      // Update the page content with the new ID, keeping the old content
      await setDoc(doc(db, 'pages', newId), { content: oldPageContent })

      // Delete the old documents only after creating the new ones
      await deleteDoc(doc(db, 'menu', pageId))
      await deleteDoc(doc(db, 'pages', pageId))

      // Update all child items with the new parent ID
      const updateChildItems = async (oldParentId: string, newParentId: string) => {
        const childQuery = query(collection(db, 'menu'), where('parentId', '==', oldParentId))
        const childSnapshot = await getDocs(childQuery)
        
        for (const childDoc of childSnapshot.docs) {
          const childData = childDoc.data() as MenuItem
          const childNewId = `${newParentId}-${childData.path.split('/').pop()}`
          const childNewPath = `${newFullPath}/${childData.path.split('/').pop()}`
          
          // Get the content of the old child page
          const oldChildPageDoc = await getDoc(doc(db, 'pages', childDoc.id))
          const oldChildPageContent = oldChildPageDoc.exists() ? oldChildPageDoc.data().content : ''

          // Create new menu item for the child
          await setDoc(doc(db, 'menu', childNewId), {
            ...childData,
            id: childNewId,
            path: childNewPath,
            parentId: newParentId
          })

          // Create new page document for the child with the old content
          await setDoc(doc(db, 'pages', childNewId), { content: oldChildPageContent })

          // Delete old documents for the child
          await deleteDoc(doc(db, 'menu', childDoc.id))
          await deleteDoc(doc(db, 'pages', childDoc.id))
          
          // Recursively update grandchildren
          await updateChildItems(childDoc.id, childNewId)
        }
      }

      await updateChildItems(pageId, newId)

      setEditingPageId(null)
      setEditedTitle('')
    } catch (error) {
      console.error('Error updating item:', error)
    }
  }

  const deletePage = async (pageId: string) => {
    try {
      // Delete the page from the menu
      await deleteDoc(doc(db, 'menu', pageId))

      // Delete the page content
      await deleteDoc(doc(db, 'pages', pageId))

      // Find and delete all child pages recursively
      const deleteChildPages = async (parentId: string) => {
        const childQuery = query(collection(db, 'menu'), where('parentId', '==', parentId))
        const childSnapshot = await getDocs(childQuery)
        
        for (const childDoc of childSnapshot.docs) {
          const childId = childDoc.id
          await deleteDoc(doc(db, 'menu', childId))
          await deleteDoc(doc(db, 'pages', childId))
          await deleteChildPages(childId)
        }
      }

      await deleteChildPages(pageId)

      setShowDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting page:', error)
    }
  }

  const getChildItems = (parentId: string | null) => {
    return menuItems.filter(item => item.parentId === parentId)
  }

  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const children = getChildItems(item.id)
    
    return (
      <li key={item.id} className={`relative group ${depth === 0 ? 'flex-shrink-0 text-center border-r border-black border-opacity-20 last:border-0' : ''}`}>
        <a
          href={`/${item.path.replace(/\//g, '-')}`}
          className={`block transform hover:scale-105 hover:underline transition-transform duration-100 ${depth === 0 ? 'text-white' : 'text-white'} text-xs whitespace-nowrap 2xl:text-sm py-1 px-2`}
        >
          {item.title}
          {children.length > 0 && (depth === 0 ? <ChevronDown className="inline-block w-4 h-4 ml-1" /> : <ChevronRight className="inline-block w-4 h-4 ml-1" />)}
        </a>
        {(children.length > 0 || depth === 0) && (
          <div
            className={`absolute ${depth === 0 ? 'left-0 top-full' : 'left-full top-0'} mt-2 w-48 rounded-md shadow-lg bg-customGreen ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10`}
          >
            <ul className="py-0">
              {children.map(child => renderMenuItem(child, depth + 1))}
            </ul>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAddForm(item.id);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-green-600 border-t border-white border-opacity-20"
            >
              <Plus className="inline-block w-4 h-4 mr-2" />
              Add Subpage
            </button>
          </div>
        )}
        {editingPageId === item.id ? (
          <div className="absolute z-50 mt-2 w-64 bg-customGreen rounded-md shadow-lg p-4">
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-black"
              placeholder="Edit title"
            />
            <button
              onClick={() => updatePageTitle(item.id)}
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <Check className="inline-block w-4 h-4 mr-2" />
              Save
            </button>
          </div>
        ) : (
          <div className="absolute top-0 right-0 mt-1 mr-1 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingPageId(item.id);
                setEditedTitle(item.title);
              }}
              className="text-white"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(item.id);
              }}
              className="text-white"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </li>
    );}
    
    const renderMobileMenuItem = (item: MenuItem, depth = 0) => {
      const children = getChildItems(item.id);
    
      return (
        <li key={item.id}>
          <div className={`flex items-center justify-between py-4 px-6 hover:bg-green-600 rounded-lg hover:scale-105 transition-all duration-300 ease-in-out ${depth > 0 ? 'ml-4' : ''}`}>
            <a href={`/${item.path.replace(/\//g, '-')}`} onClick={toggleMenu} className="flex-grow">
              {item.title}
            </a>
            {children.length > 0 && (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
          {children.length > 0 && (
            <ul className="ml-4">
              {children.map(child => renderMobileMenuItem(child, depth + 1))}
            </ul>
          )}
          <div className="flex justify-between px-6 py-2">
            <button
              onClick={() => setShowAddForm(item.id)}
              className={`text-sm text-white hover:bg-green-600 ${depth > 0 ? 'ml-4' : ''}`}
            >
              <Plus className="inline-block w-4 h-4 mr-2" />
              Add Subpage
            </button>
            <div className="space-x-2">
              <button
                onClick={() => {
                  setEditingPageId(item.id);
                  setEditedTitle(item.title);
                }}
                className="text-white"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(item.id)}
                className="text-white"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </li>
      );
    };
    
    const allMenuItems = [
      ...menuItems,
    ];
    
    return (
      <nav className="bg-customGreen text-sm font-bold flex self-end justify-center items-center rounded-l-xl lg:rounded-none lg:rounded-b-xl shadow-lg w-8 lg:w-full z-40 relative">
        <div className="container mx-auto py-1 flex justify-center items-center px-4 max-w-full ">
          <button
            className="block lg:hidden text-white focus:outline-none"
            onClick={toggleMenu}
          >
            <Menu className="w-6 h-6" />
          </button>
    
          <ul className="hidden lg:flex lg:justify-between lg:items-center lg:flex-wrap text-white space-x-1">
            {allMenuItems.filter(item => item.parentId === null).map(item => renderMenuItem(item))}
            {/* 
            <li className="flex-grow text-center border-r border-black border-opacity-20 last:border-0">
              <button
                onClick={() => setShowAddForm('root')}
                className="block w-full transform hover:scale-105 hover:underline transition-transform duration-100 text-white text-xs whitespace-nowrap 2xl:text-sm py-1 px-2"
              >
                <Plus className="inline-block w-4 h-4 mr-2" />
                Add Page
              </button>
            </li>
            */}
          </ul>
        </div>
    
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleMenu} />
        )}
    
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
          <ul className="mt-16 text-white space-y-4">
            {allMenuItems.filter(item => item.parentId === null).map(item => renderMobileMenuItem(item))}
            {/*
              <li>
              <button
                onClick={() => setShowAddForm('root')}
                className="flex items-center py-4 px-6 hover:bg-green-600 rounded-lg hover:scale-105 transition-all duration-300 ease-in-out w-full text-left"
              >
                <Plus className="w-6 h-6 mr-3" />
                Add Page
              </button>
            </li>
            */}
          </ul>
        </div>
    
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-customGreen rounded-md shadow-lg p-4 w-64">
              <input
                type="text"
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-gray-700"
                placeholder="Page title"
              />
              <div className="mt-2 flex justify-end gap-2">
                <button
                  onClick={() => addNewPage(showAddForm === 'root' ? null : showAddForm)}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddForm(null)}
                  className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
    
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-md shadow-lg p-4 w-64">
              <p className="text-black text-center">Are you sure you want to delete this page?</p>
              <div className="mt-2 flex justify-end gap-2">
                <button
                  onClick={() => deletePage(showDeleteConfirm)}
                  className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    );
  }