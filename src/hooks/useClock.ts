import { useState, useEffect } from 'react'

export function useClock(format: '12h' | '24h' = '24h') {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const hours = time.getHours()
  const minutes = time.getMinutes()
  const seconds = time.getSeconds()

  let timeString: string
  if (format === '12h') {
    const h12 = hours % 12 || 12
    const ampm = hours >= 12 ? 'PM' : 'AM'
    timeString = `${String(h12).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} ${ampm}`
  } else {
    timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  const dateString = `${time.getFullYear()}年${time.getMonth() + 1}月${time.getDate()}日`
  const dayOfWeek = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][time.getDay()]
  const dateStringShort = `${time.getFullYear()}-${String(time.getMonth() + 1).padStart(2, '0')}-${String(time.getDate()).padStart(2, '0')}`

  const greeting = hours < 6 ? '夜深了' : hours < 9 ? '早上好' : hours < 12 ? '上午好' : hours < 14 ? '中午好' : hours < 18 ? '下午好' : hours < 22 ? '晚上好' : '夜深了'

  return {
    time,
    timeString,
    dateString,
    dateStringShort,
    dayOfWeek,
    greeting,
    hours,
    minutes,
    seconds,
  }
}
