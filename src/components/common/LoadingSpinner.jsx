import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export default function LoadingSpinner() {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prevProgress => {
        const newProgress = prevProgress + 1
        if (newProgress >= 100) {
          clearInterval(interval)
          setTimeout(() => setIsVisible(false), 500) // Hide after 500ms at 100%
        }
        return newProgress > 100 ? 100 : newProgress
      })
    }, 50)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const checkDataLoaded = () => {
      const adminDashboardLoading = document.getElementById('admin-dashboard-loading')
      if (!adminDashboardLoading) {
        setProgress(100)
      } else {
        requestAnimationFrame(checkDataLoaded)
      }
    }

    checkDataLoaded()
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-gray-100 z-50"
        >
          <div className="w-64 space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="h-8 w-8 text-blue-500" />
              </motion.div>
              <span className="text-xl font-semibold text-gray-700">Cargando...</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-center text-sm text-gray-500">{progress}% completado</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}