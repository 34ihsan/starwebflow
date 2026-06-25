'use client'

import React, { useEffect, useState } from 'react'
import { Bell, Mail, ShieldAlert, AlertTriangle, Info, Trash2, CheckCircle2 } from 'lucide-react'
import { getTechnologyUpdates } from '@/app/actions/technologies'
import { triggerEmailCampaignForUpdate, deleteTechnologyUpdate } from '@/app/actions/tech-updates'

export default function TechUpdatesPage() {
  const [updates, setUpdates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingEmail, setSendingEmail] = useState<string | null>(null)

  const loadUpdates = async () => {
    setLoading(true)
    const res = await getTechnologyUpdates()
    if (res.success && res.data) {
      setUpdates(res.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadUpdates()
  }, [])

  const handleSendEmail = async (updateId: string) => {
    if (!confirm('Are you sure you want to generate an email campaign for this update? This will notify all clients using this technology.')) return

    setSendingEmail(updateId)
    const res = await triggerEmailCampaignForUpdate(updateId)
    if (res.success) {
      alert(`Successfully generated email campaign for ${res.count} clients. Check Bulk Outreach to send them.`)
      loadUpdates()
    } else {
      alert('Error: ' + res.error)
    }
    setSendingEmail(null)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this update record?')) {
      await deleteTechnologyUpdate(id)
      loadUpdates()
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <ShieldAlert className="w-5 h-5 text-red-500" />
      case 'HIGH': return <AlertTriangle className="w-5 h-5 text-orange-500" />
      case 'MEDIUM': return <Info className="w-5 h-5 text-blue-500" />
      default: return <Bell className="w-5 h-5 text-zinc-500" />
    }
  }

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'HIGH': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'MEDIUM': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      default: return 'bg-zinc-800 text-zinc-300 border-zinc-700'
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Technology Updates</h1>
          <p className="text-zinc-400">Review RSS updates and notify clients of critical changes.</p>
        </div>
        <button 
          onClick={loadUpdates}
          className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 text-sm"
        >
          Refresh Feed
        </button>
      </div>

      {loading ? (
        <div className="text-zinc-400">Loading updates...</div>
      ) : updates.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-xl p-12 text-center">
          <Bell className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Updates Found</h3>
          <p className="text-zinc-400">We will notify you here when the RSS cron fetches new updates.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {updates.map(update => (
            <div key={update.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col md:flex-row gap-4">
              <div className="flex-shrink-0 pt-1">
                {getSeverityIcon(update.severity)}
              </div>
              <div className="flex-grow">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">{update.technology?.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded border ${getSeverityClass(update.severity)}`}>
                        {update.severity}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-zinc-200 mb-2">
                      {update.sourceUrl ? (
                        <a href={update.sourceUrl} target="_blank" rel="noreferrer" className="hover:underline hover:text-[#4F8EF7]">
                          {update.title}
                        </a>
                      ) : (
                        update.title
                      )}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">
                      {new Date(update.createdAt).toLocaleDateString()}
                    </span>
                    <button onClick={() => handleDelete(update.id)} className="text-zinc-600 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-zinc-400 mb-4 line-clamp-3">
                  {update.description}
                </p>

                <div className="flex items-center gap-3">
                  {update.emailSent ? (
                    <div className="flex items-center gap-1.5 text-sm text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-lg">
                      <CheckCircle2 className="w-4 h-4" />
                      Client Notification Sent
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSendEmail(update.id)}
                      disabled={sendingEmail === update.id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#4F8EF7] text-white text-sm rounded-lg hover:bg-[#3d6ec2] disabled:opacity-50"
                    >
                      <Mail className="w-4 h-4" />
                      {sendingEmail === update.id ? 'Generating...' : 'Notify Affected Clients'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
