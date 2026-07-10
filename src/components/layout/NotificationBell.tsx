'use client'

import { useState, useEffect } from 'react'
import { Bell, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  link?: string
  isRead: boolean
  createdAt: string
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const unreadCount = notifications.filter(n => !n.isRead).length

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/v1/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000) // check every minute
    return () => clearInterval(interval)
  }, [])

  const markAsRead = async (id?: string) => {
    try {
      const payload = id ? { id } : { markAllRead: true }
      await fetch('/api/v1/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      fetchNotifications()
    } catch (error) {
      console.error('Failed to mark read', error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    setIsOpen(false)
    if (notification.link) {
      router.push(notification.link)
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors text-[#94A3B8] hover:text-white relative"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border border-[#0A0A0F]"></span>
        )}
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-80 bg-[#131B2A] border border-white/[0.05] rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-white/[0.05] flex items-center justify-between bg-[#0A0A0F]/50">
              <h3 className="font-semibold text-white">Bildirimler</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={() => markAsRead()}
                  className="text-xs text-[#8B5CF6] hover:text-white transition-colors flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Tümünü Okundu İşaretle
                </button>
              )}
            </div>
            
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-[#64748B] text-sm">
                  Henüz bildirim bulunmuyor.
                </div>
              ) : (
                <div className="divide-y divide-white/[0.02]">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-4 hover:bg-white/[0.02] cursor-pointer transition-colors ${!notif.isRead ? 'bg-white/[0.01]' : 'opacity-70'}`}
                    >
                      <div className="flex items-start gap-3">
                        {!notif.isRead && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] mt-1.5 shrink-0"></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!notif.isRead ? 'text-white font-medium' : 'text-[#E2E8F0]'}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-[#94A3B8] mt-1 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-[#64748B] mt-2">
                            {new Date(notif.createdAt).toLocaleString('tr-TR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
