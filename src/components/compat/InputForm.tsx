// @ts-nocheck
'use client'
import { useState } from 'react';

// 주요 도시 위경도 프리셋
const LOCATION_PRESETS = [
  { label: '서울',    lon: 126.978, lat: 37.566 },
  { label: '부산',    lon: 129.075, lat: 35.180 },
  { label: '대구',    lon: 128.601, lat: 35.868 },
  { label: '인천',    lon: 126.705, lat: 37.456 },
  { label: '광주',    lon: 126.852, lat: 35.160 },
  { label: '대전',    lon: 127.385, lat: 36.350 },
  { label: '제주',    lon: 126.531, lat: 33.499 },
  { label: '평양',    lon: 125.754, lat: 39.034 },
  { label: '도쿄',    lon: 139.692, lat: 35.690 },
  { label: '베이징',  lon: 116.407, lat: 39.904 },
  { label: '뉴욕',    lon: -74.006, lat: 40.714 },
  { label: '직접입력', lon: null, lat: null }
];

const MBTI_TYPES = [
  'INTJ','INTP','ENTJ','ENTP',
  'INFJ','INFP','ENFJ','ENFP',
  'ISTJ','ISFJ','ESTJ','ESFJ',
  'ISTP','ISFP','ESTP','ESFP'
];

const REL_TYPES = [
  { value: 'romantic',     label: '남녀 궁합',      icon: '♥', desc: '연인·부부 관계 궁합 분석' },
  { value: 'work',         label: '직장 상하 궁합',  icon: '⚖', desc: '상사-부하, 동업자 관계' },
  { value: 'parent_child', label: '부모-자녀 궁합',  icon: '☯', desc: '부모와 자녀의 관계 역학' }
];

function PersonForm({ label, data, onChange }) {
  const [locPreset, setLocPreset] = useState('서울');

  function handleField(field, value) {
    onChange({ ...data, [field]: value });
  }

  function handleLocationPreset(label) {
    setLocPreset(label);
    const preset = LOCATION_PRESETS.find(p => p.label === label);
    if (preset && preset.lon !== null) {
      onChange({ ...data, longitude: preset.lon, latitude: preset.lat });
    }
  }

  return (
    <div className="section-card">
      <div className="section-title">{label}</div>
      <div className="space-y-4">
        {/* 이름 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-ink-500 mb-1">이름 (선택)</label>
            <input
              type="text"
              placeholder="홍길동"
              value={data.name || ''}
              onChange={e => handleField('name', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ink-400"
            />
          </div>
          <div>
            <label className="block text-xs text-ink-500 mb-1">성별</label>
            <select
              value={data.gender || ''}
              onChange={e => handleField('gender', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ink-400"
            >
              <option value="">선택</option>
              <option value="M">남성</option>
              <option value="F">여성</option>
            </select>
          </div>
        </div>

        {/* MBTI */}
        <div>
          <label className="block text-xs text-ink-500 mb-1">MBTI <span className="text-ink-400">(선택 — 입력 시 MBTI 궁합 분석 추가)</span></label>
          <select
            value={data.mbti || ''}
            onChange={e => handleField('mbti', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ink-400"
          >
            <option value="">선택 안 함</option>
            {MBTI_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* 생년월일 + 양력/음력 선택 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-ink-500">생년월일 <span className="text-red-500">*</span></label>
            <div className="flex rounded-lg border border-ink-200 overflow-hidden text-xs">
              {['solar', 'lunar'].map(ct => (
                <button
                  key={ct}
                  type="button"
                  onClick={() => handleField('calendarType', ct)}
                  className={`px-2.5 py-1 transition-colors ${
                    (data.calendarType || 'solar') === ct
                      ? 'bg-ink-800 text-white'
                      : 'bg-white text-ink-500 hover:bg-ink-50'
                  }`}
                >
                  {ct === 'solar' ? '양력' : '음력'}
                </button>
              ))}
            </div>
          </div>
          {(data.calendarType || 'solar') === 'lunar' && (
            <div className="mb-1.5 space-y-1">
              <p className="text-xs text-amber-600">⚠ 음력 → 양력 자동 변환 (만세력 DB 미사용 — ±1일 오차 가능)</p>
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!data.isLeapMonth}
                  onChange={e => handleField('isLeapMonth', e.target.checked)}
                  className="w-3.5 h-3.5 accent-amber-600"
                />
                <span className="text-xs text-amber-700 font-medium">윤달(閏月)</span>
                <span className="text-xs text-ink-400">— 해당 월이 윤달인 경우 체크</span>
              </label>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              placeholder="연도"
              min="1900" max="2100"
              value={data.year || ''}
              onChange={e => handleField('year', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ink-400"
            />
            <input
              type="number"
              placeholder="월"
              min="1" max="12"
              value={data.month || ''}
              onChange={e => handleField('month', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ink-400"
            />
            <input
              type="number"
              placeholder="일"
              min="1" max="31"
              value={data.day || ''}
              onChange={e => handleField('day', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ink-400"
            />
          </div>
        </div>

        {/* 출생 시각 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-ink-500">출생 시각 (KST)</label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={data.hourUnknown || false}
                onChange={e => handleField('hourUnknown', e.target.checked)}
                className="w-3.5 h-3.5 accent-ink-600"
              />
              <span className="text-xs text-ink-400">시간 불명</span>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <input
                type="number"
                placeholder="시 (0~23)"
                min="0" max="23"
                disabled={data.hourUnknown}
                value={data.hourUnknown ? '' : (data.hour ?? '')}
                onChange={e => handleField('hour', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ink-400 disabled:bg-ink-100 disabled:text-ink-400"
              />
            </div>
            <input
              type="number"
              placeholder="분 (0~59)"
              min="0" max="59"
              disabled={data.hourUnknown}
              value={data.hourUnknown ? '' : (data.minute ?? '')}
              onChange={e => handleField('minute', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ink-400 disabled:bg-ink-100 disabled:text-ink-400"
            />
          </div>
          {data.hourUnknown && (
            <p className="text-xs text-amber-600 mt-1">⚠ 시간 불명 시 시주(時柱)·자미두수 신뢰도 저하</p>
          )}
        </div>

        {/* 출생지 */}
        <div>
          <label className="block text-xs text-ink-500 mb-1">출생지 (경도 보정용)</label>
          <div className="flex gap-2 mb-2 flex-wrap">
            {LOCATION_PRESETS.slice(0, 7).map(p => (
              <button
                key={p.label}
                onClick={() => handleLocationPreset(p.label)}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  locPreset === p.label
                    ? 'bg-ink-800 text-white border-ink-800'
                    : 'bg-white text-ink-600 border-ink-200 hover:border-ink-400'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-ink-400 mb-1">경도 (동경+)</label>
              <input
                type="number"
                step="0.001"
                placeholder="127.000"
                value={data.longitude ?? 126.978}
                onChange={e => { handleField('longitude', e.target.value); setLocPreset('직접입력'); }}
                className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ink-400"
              />
            </div>
            <div>
              <label className="block text-xs text-ink-400 mb-1">위도 (북위+)</label>
              <input
                type="number"
                step="0.001"
                placeholder="37.566"
                value={data.latitude ?? 37.566}
                onChange={e => { handleField('latitude', e.target.value); setLocPreset('직접입력'); }}
                className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ink-400"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_PERSON = { longitude: 126.978, latitude: 37.566 };

export default function InputForm({ onSubmit, initialData }) {
  const [personA, setPersonA] = useState(initialData?.personA || DEFAULT_PERSON);
  const [personB, setPersonB] = useState(initialData?.personB || DEFAULT_PERSON);
  const [relType, setRelType] = useState(initialData?.relationType || 'romantic');
  const [errors, setErrors] = useState([]);

  function validate() {
    const errs = [];
    const check = (p, label) => {
      if (!p.year || !p.month || !p.day) {
        errs.push(`${label}: 생년월일 필수`);
        return;
      }
      const y = parseInt(p.year), m = parseInt(p.month), d = parseInt(p.day);
      if (y < 1900 || y > 2100) errs.push(`${label}: 연도는 1900~2100 범위`);
      const maxDay = new Date(y, m, 0).getDate();
      if (d > maxDay) errs.push(`${label}: ${y}년 ${m}월은 최대 ${maxDay}일`);
      if (!p.hourUnknown && p.hour !== '' && p.hour !== undefined) {
        const h = parseInt(p.hour);
        if (isNaN(h) || h < 0 || h > 23) errs.push(`${label}: 시각은 0~23시`);
      }
    };
    check(personA, '인물 A');
    check(personB, '인물 B');
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (errs.length) { setErrors(errs); return; }
    setErrors([]);
    onSubmit({ personA, personB, relationType: relType });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-gray-900">
      {/* 관계 유형 선택 */}
      <div className="section-card">
        <div className="section-title">관계 유형 선택</div>
        <div className="grid grid-cols-3 gap-3">
          {REL_TYPES.map(rt => (
            <button
              key={rt.value}
              type="button"
              onClick={() => setRelType(rt.value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                relType === rt.value
                  ? 'border-ink-700 bg-ink-900 text-white'
                  : 'border-ink-200 bg-white text-ink-700 hover:border-ink-400'
              }`}
            >
              <span className="text-2xl">{rt.icon}</span>
              <span className="text-sm font-semibold">{rt.label}</span>
              <span className={`text-xs text-center ${relType === rt.value ? 'text-ink-300' : 'text-ink-400'}`}>
                {rt.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 두 인물 입력 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PersonForm label="인물 A" data={personA} onChange={setPersonA} />
        <PersonForm label="인물 B" data={personB} onChange={setPersonB} />
      </div>

      {/* 오류 표시 */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          {errors.map((e, i) => <p key={i} className="text-red-700 text-sm">· {e}</p>)}
        </div>
      )}

      {/* 가중치 안내 */}
      <div className="bg-ink-100 rounded-lg p-4 text-xs text-ink-500">
        <p className="font-medium text-ink-600 mb-1">분석 엔진 가중치 ({relType === 'romantic' ? '남녀 궁합' : relType === 'work' ? '직장 궁합' : '자녀 궁합'}{personA.mbti && personB.mbti ? ' · MBTI 포함' : ''})</p>
        {relType === 'romantic'     && !personA.mbti && !personB.mbti && <p>사주(일지합충·조후) 40% · 서양점성술(금성·화성·달) 40% · 자미두수(부처궁) 20%</p>}
        {relType === 'work'         && !personA.mbti && !personB.mbti && <p>사주(격국·십성) 50% · 자미두수(노복·천이궁) 30% · 점성술(수성·토성) 20%</p>}
        {relType === 'parent_child' && !personA.mbti && !personB.mbti && <p>점성술(4·5하우스·달) 40% · 자미두수(자녀궁) 30% · 사주(식상·시주) 30%</p>}
        {relType === 'romantic'     && personA.mbti && personB.mbti && <p>사주 35% · 점성술 35% · 자미두수 15% · MBTI 15%</p>}
        {relType === 'work'         && personA.mbti && personB.mbti && <p>사주 40% · 자미두수 25% · MBTI 20% · 점성술 15%</p>}
        {relType === 'parent_child' && personA.mbti && personB.mbti && <p>점성술 30% · MBTI 20% · 사주 25% · 자미두수 25%</p>}
      </div>

      {/* 제출 */}
      <button
        type="submit"
        className="w-full bg-ink-900 hover:bg-ink-800 text-white py-4 rounded-xl font-semibold text-base transition-colors shadow-lg"
      >
        역학 궁합 분석 시작
      </button>
    </form>
  );
}