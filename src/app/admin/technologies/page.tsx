'use client'

import React, { useEffect, useState } from 'react'
import { Plus, Rss, AlertCircle, Trash2 } from 'lucide-react'
import { getTechnologies, createTechnology, deleteTechnology } from '@/app/actions/technologies'

export default function TechnologiesPage() {
  const [technologies, setTechnologies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'WEB',
    rssFeedUrl: '',
    description: ''
  })

  const loadTechnologies = async () => {
    setLoading(true)
    const res = await getTechnologies()
    if (res.success) {
      setTechnologies(res.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadTechnologies()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await createTechnology(formData)
    if (res.success) {
      setShowForm(false)
      setFormData({ name: '', category: 'WEB', rssFeedUrl: '', description: '' })
      loadTechnologies()
    } else {
      alert('Error creating technology: ' + res.error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this technology?')) {
      await deleteTechnology(id)
      loadTechnologies()
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Technologies & RSS Tracking</h1>
          <p className="text-zinc-400">Manage technologies used in projects and track their updates via RSS.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[#4F8EF7] text-white rounded-lg hover:bg-[#3d6ec2] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Technology
        </button>
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-medium text-white mb-4">Add New Technology</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Name</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white"
                placeholder="e.g. Next.js, Google Core Update"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white"
              >
                <option value="WEB">Web Development</option>
                <option value="SEO">SEO</option>
                <option value="AI">AI & Machine Learning</option>
                <option value="INFRASTRUCTURE">Infrastructure</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-1">RSS Feed URL (Optional)</label>
              <input 
                type="url" 
                value={formData.rssFeedUrl}
                onChange={(e) => setFormData({...formData, rssFeedUrl: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white"
                placeholder="https://nextjs.org/feed.xml"
              />
              <p className="text-xs text-zinc-500 mt-1">Updates will be automatically fetched from this RSS feed.</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-1">Description</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white"
                rows={3}
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-zinc-200"
              >
                Save Technology
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-zinc-400">Loading technologies...</div>
      ) : technologies.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-xl p-12 text-center">
          <AlertCircle className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Technologies Tracked</h3>
          <p className="text-zinc-400">Add technologies to start tracking RSS updates and assigning them to client projects.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {technologies.map(tech => (
            <div key={tech.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-medium text-white">{tech.name}</h3>
                <button onClick={() => handleDelete(tech.id)} className="text-zinc-500 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <span className="inline-block px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded mb-3">
                {tech.category}
              </span>
              
              {tech.rssFeedUrl ? (
                <div className="flex items-center gap-2 text-sm text-[#4F8EF7] mb-3">
                  <Rss className="w-4 h-4" />
                  <span className="truncate" title={tech.rssFeedUrl}>RSS Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-zinc-500 mb-3">
                  <AlertCircle className="w-4 h-4" />
                  <span>No RSS Configured</span>
                </div>
              )}

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800/50 text-sm">
                <div className="text-zinc-400">
                  <strong className="text-white">{tech._count.projects}</strong> Projects
                </div>
                <div className="text-zinc-400">
                  <strong className="text-white">{tech._count.updates}</strong> Updates
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
