import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ChevronLeft, ChevronRight, Calendar, Check, X,
  Send, Smile, Loader2, Edit3,
} from 'lucide-react'
import { format, addDays, subDays } from 'date-fns'
import { useAuthStore } from '@/stores/authStore'
import { useCheckInStore } from '@/stores/checkInStore'
import { MOOD_OPTIONS, type CheckInItem } from '@/types'

export default function CheckInPage() {
  const { date } = useParams<{ date?: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const {
    items, currentDateRecords,
    loadItems, loadRecordsByDate, createRecord, updateRecord, deleteRecord,
    isLoading,
  } = useCheckInStore()

  const selectedDate = date ? new Date(date) : new Date()
  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  const today = format(new Date(), 'yyyy-MM-dd')
  const isToday = dateStr === today

  const [activeItem, setActiveItem] = useState<number | null>(null)
  const [contentInputs, setContentInputs] = useState<Record<number, string>>({})
  const [moodInputs, setMoodInputs] = useState<Record<number, string>>({})
  const [savingItems, setSavingItems] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (user) {
      loadItems(user.id)
      loadRecordsByDate(user.id, dateStr)
    }
  }, [user, dateStr, loadItems, loadRecordsByDate])

  // Pre-fill content and mood from existing records
  useEffect(() => {
    const contents: Record<number, string> = {}
    const moods: Record<number, string> = {}
    currentDateRecords.forEach((r) => {
      contents[r.item_id] = r.content || ''
      moods[r.item_id] = r.mood || ''
    })
    setContentInputs(contents)
    setMoodInputs(moods)
  }, [currentDateRecords])

  const isChecked = (itemId: number) =>
    currentDateRecords.some((r) => r.item_id === itemId)

  const getRecord = (itemId: number) =>
    currentDateRecords.find((r) => r.item_id === itemId)

  const handleToggleCheck = async (item: CheckInItem) => {
    if (!user) return
    setSavingItems((prev) => new Set(prev).add(item.id))

    const checked = isChecked(item.id)
    if (checked) {
      const record = getRecord(item.id)
      if (record) {
        await deleteRecord(record.id)
      }
    } else {
      await createRecord(user.id, {
        item_id: item.id,
        check_date: dateStr,
        content: contentInputs[item.id] || '',
        mood: moodInputs[item.id] || '',
      })
    }

    await loadRecordsByDate(user.id, dateStr)
    setSavingItems((prev) => {
      const next = new Set(prev)
      next.delete(item.id)
      return next
    })
  }

  const handleSaveContent = async (item: CheckInItem) => {
    if (!user) return
    const record = getRecord(item.id)
    if (!record) return

    setSavingItems((prev) => new Set(prev).add(item.id))
    await updateRecord(record.id, {
      content: contentInputs[item.id] || '',
      mood: moodInputs[item.id] || '',
    })
    await loadRecordsByDate(user.id, dateStr)
    setSavingItems((prev) => {
      const next = new Set(prev)
      next.delete(item.id)
      return next
    })
    setActiveItem(null)
  }

  const goToDate = (d: Date) => {
    const ds = format(d, 'yyyy-MM-dd')
    if (ds === today) navigate('/check-in')
    else navigate(`/check-in/${ds}`)
  }

  const completedCount = items.filter((i) => isChecked(i.id)).length
  const completionRate = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Date Navigator */}
      <div className="card">
        <div className="flex items-center justify-between">
          <button onClick={() => goToDate(subDays(selectedDate, 1))} className="btn-ghost p-2">
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-500" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                {format(selectedDate, 'yyyy年M月d日')}
              </h2>
              {isToday && (
                <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 text-xs rounded-full font-medium">
                  今天
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {format(selectedDate, 'EEEE')} · {completedCount}/{items.length} 已完成
            </p>
            {/* Mini progress */}
            <div className="w-48 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-2 mx-auto overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => goToDate(addDays(selectedDate, 1))}
            disabled={isToday}
            className="btn-ghost p-2 disabled:opacity-30"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Check-in Items */}
      <div className="space-y-3">
        {items.map((item) => {
          const checked = isChecked(item.id)
          const isActive = activeItem === item.id
          const isSaving = savingItems.has(item.id)

          return (
            <div
              key={item.id}
              className={`card transition-all duration-300 ${
                checked ? 'border-green-200 dark:border-green-500/30 bg-green-50/50 dark:bg-green-500/5' : ''
              } ${isActive ? 'ring-2 ring-primary-500/50 shadow-lg' : ''}`}
            >
              <div className="flex items-center gap-4">
                {/* Check Button */}
                <button
                  onClick={() => handleToggleCheck(item)}
                  disabled={isSaving}
                  className={`flex-shrink-0 w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${
                    checked
                      ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/25'
                      : 'border-gray-300 dark:border-gray-500 hover:border-primary-400 text-transparent hover:text-primary-300'
                  }`}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : checked ? (
                    <Check className="w-5 h-5 check-animate" />
                  ) : (
                    <div className="w-5 h-5" />
                  )}
                </button>

                {/* Item Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-400 mt-0.5 ml-8">{item.description}</p>
                  )}

                  {/* Content display when checked */}
                  {checked && !isActive && (
                    <div className="ml-8 mt-2 flex items-center gap-2">
                      {getRecord(item.id)?.mood && (
                        <span className="text-sm">{getRecord(item.id)?.mood}</span>
                      )}
                      {getRecord(item.id)?.content && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-1 rounded-lg flex-1">
                          {getRecord(item.id)?.content}
                        </p>
                      )}
                      <button
                        onClick={() => setActiveItem(item.id)}
                        className="text-gray-400 hover:text-primary-500 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Expand/Collapse */}
                {checked && (
                  <button
                    onClick={() => setActiveItem(isActive ? null : item.id)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Expanded Content Editor */}
              {isActive && checked && (
                <div className="mt-4 pl-14 animate-slide-up space-y-3">
                  {/* Mood Selector */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
                      今日心情
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {MOOD_OPTIONS.map((mood) => (
                        <button
                          key={mood.label}
                          onClick={() =>
                            setMoodInputs((prev) => ({ ...prev, [item.id]: mood.emoji }))
                          }
                          className={`px-3 py-1.5 rounded-lg text-sm border transition-all duration-200 ${
                            moodInputs[item.id] === mood.emoji
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          {mood.emoji} {mood.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Content Input */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
                      打卡内容
                    </label>
                    <textarea
                      value={contentInputs[item.id] || ''}
                      onChange={(e) =>
                        setContentInputs((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      placeholder={`记录你的${item.name}情况...`}
                      rows={3}
                      className="input resize-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setActiveItem(null)}
                      className="btn-ghost text-sm"
                    >
                      <X className="w-4 h-4" />
                      取消
                    </button>
                    <button
                      onClick={() => handleSaveContent(item)}
                      disabled={isSaving}
                      className="btn-primary text-sm"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      保存
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">还没有打卡项目</p>
          <button onClick={() => navigate('/items')} className="text-primary-500 mt-2 hover:underline">
            去添加项目 →
          </button>
        </div>
      )}
    </div>
  )
}
