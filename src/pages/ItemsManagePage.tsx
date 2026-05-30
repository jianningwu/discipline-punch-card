import { useEffect, useState } from 'react'
import {
  Plus, Trash2, Edit3, X, Check, Loader2, GripVertical,
  ListTodo, Palette,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useCheckInStore } from '@/stores/checkInStore'
import { EMOJI_OPTIONS, COLOR_OPTIONS, type CheckInItem } from '@/types'

export default function ItemsManagePage() {
  const user = useAuthStore((s) => s.user)
  const { items, loadItems, createItem, updateItem, deleteItem } = useCheckInStore()

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<CheckInItem | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formIcon, setFormIcon] = useState('⭐')
  const [formColor, setFormColor] = useState('#6366f1')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (user) loadItems(user.id)
  }, [user, loadItems])

  const resetForm = () => {
    setFormName('')
    setFormDesc('')
    setFormIcon('⭐')
    setFormColor('#6366f1')
    setFormError('')
    setEditingItem(null)
    setShowAddForm(false)
  }

  const openEditForm = (item: CheckInItem) => {
    setEditingItem(item)
    setFormName(item.name)
    setFormDesc(item.description)
    setFormIcon(item.icon)
    setFormColor(item.color)
    setShowAddForm(true)
    setFormError('')
  }

  const handleSubmit = async () => {
    if (!user) return
    if (!formName.trim()) {
      setFormError('请输入项目名称')
      return
    }

    setSaving(true)
    if (editingItem) {
      await updateItem(editingItem.id, {
        name: formName.trim(),
        description: formDesc.trim(),
        icon: formIcon,
        color: formColor,
      })
    } else {
      await createItem(user.id, {
        name: formName.trim(),
        description: formDesc.trim(),
        icon: formIcon,
        color: formColor,
      })
    }

    await loadItems(user.id)
    setSaving(false)
    resetForm()
  }

  const handleDelete = async (item: CheckInItem) => {
    if (!confirm(`确定要删除「${item.name}」吗？此操作不可撤销。`)) return
    await deleteItem(item.id)
    if (user) await loadItems(user.id)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ListTodo className="w-6 h-6 text-primary-500" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">打卡项目管理</h2>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddForm(true) }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          添加项目
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="card animate-slide-up ring-2 ring-primary-500/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              {editingItem ? '编辑打卡项目' : '添加新打卡项目'}
            </h3>
            <button onClick={resetForm} className="btn-ghost p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {formError && (
              <div className="p-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-sm text-red-500">
                {formError}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">项目名称 *</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="例如：健身运动"
                className="input"
                maxLength={20}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">项目描述</label>
              <input
                type="text"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="例如：每天运动30分钟"
                className="input"
                maxLength={100}
              />
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                选择图标
              </label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setFormIcon(emoji)}
                    className={`w-10 h-10 text-xl flex items-center justify-center rounded-lg transition-all duration-200 ${
                      formIcon === emoji
                        ? 'bg-primary-100 dark:bg-primary-500/20 ring-2 ring-primary-500 scale-110'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Palette className="w-4 h-4 inline mr-1" />
                选择颜色
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setFormColor(color.value)}
                    className={`w-9 h-9 rounded-full transition-all duration-200 ${
                      formColor === color.value
                        ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={resetForm} className="btn-secondary">
                取消
              </button>
              <button onClick={handleSubmit} disabled={saving} className="btn-primary">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {saving ? '保存中...' : editingItem ? '保存修改' : '添加项目'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ListTodo className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">还没有打卡项目</p>
            <p className="text-sm mt-1">点击上方按钮添加你的第一个打卡项目</p>
          </div>
        ) : (
          items.map((item, idx) => (
            <div
              key={item.id}
              className="card flex items-center gap-4 hover:shadow-md transition-all duration-200 group"
            >
              <span className="text-xs text-gray-300 dark:text-gray-600 w-6 text-center">{idx + 1}</span>
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ backgroundColor: item.color + '20', color: item.color }}
              >
                {item.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</span>
                  {item.is_default === 1 && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-full">
                      默认
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-gray-400 truncate mt-0.5">{item.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditForm(item)}
                  className="btn-ghost p-1.5 text-gray-400 hover:text-primary-500"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="btn-ghost p-1.5 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
