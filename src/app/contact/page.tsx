'use client'

import type { Metadata } from 'next'
import { useState } from 'react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setStatus('success')
        setForm({ name: '', email: '', subject: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">문의하기</h1>
        <p className="text-gray-500">
          궁금한 점이나 제안사항을 자유롭게 보내주세요.
          <br />
          AI 사주 서비스 출시 알림 신청도 이 폼을 이용해 주세요.
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-8">
        {status === 'success' ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">문의가 접수되었습니다!</h2>
            <p className="text-gray-500 text-sm">
              최대한 빠르게 답변드리겠습니다. 감사합니다.
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-6 text-indigo-600 text-sm underline"
            >
              다시 문의하기
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
                  placeholder="홍길동"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  이메일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
                  placeholder="example@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                문의 유형
              </label>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
              >
                <option value="">선택해주세요</option>
                <option value="service-alert">AI 사주 서비스 출시 알림 신청</option>
                <option value="content">콘텐츠 관련 문의</option>
                <option value="collaboration">협업 제안</option>
                <option value="other">기타</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                placeholder="문의 내용을 입력해 주세요..."
              />
            </div>

            {status === 'error' && (
              <p className="text-red-500 text-sm">
                전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === 'sending' ? '전송 중...' : '문의 보내기'}
            </button>
          </form>
        )}
      </div>

      <div className="mt-8 text-center text-sm text-gray-400">
        <p>이메일로 직접 문의하실 수도 있습니다:</p>
        <a href="mailto:contact@sajulab.com" className="text-indigo-500 hover:text-indigo-700">
          contact@sajulab.com
        </a>
      </div>
    </div>
  )
}
