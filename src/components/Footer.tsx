import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export default function Footer() {
  const t  = useTranslations('footer')
  const tn = useTranslations('nav')
  const year = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">☯</span>
              <span className="text-white font-bold text-base">사주역학연구소</span>
            </div>
            <p className="text-sm leading-relaxed">{t('tagline')}</p>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-3">{t('quick_menu')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/"              className="hover:text-white transition-colors">{tn('home')}</Link></li>
              <li><Link href="/blog"          className="hover:text-white transition-colors">{tn('blog')}</Link></li>
              <li><Link href="/compatibility" className="hover:text-white transition-colors">{tn('compat')}</Link></li>
              <li><Link href="/about"         className="hover:text-white transition-colors">{tn('about')}</Link></li>
              <li><Link href="/contact"       className="hover:text-white transition-colors">{tn('contact')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-3">{t('info')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-white transition-colors">{t('privacy')}</Link></li>
              <li>
                <a href="mailto:maisondesisy@gmail.com" className="hover:text-white transition-colors">
                  maisondesisy@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-xs text-center">
          <p>{t('copyright', { year })}</p>
          <p className="mt-1 text-gray-600">{t('disclaimer')}</p>
        </div>
      </div>
    </footer>
  )
}
