import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'en' | 'ru';

const translations = {
  en: {
    nav_markets: 'MARKETS',
    nav_trade: 'TRADE',
    nav_derivatives: 'DERIVATIVES',
    nav_earn: 'EARN',
    login: 'LOGIN',
    register: 'REGISTER',
    market_overview: 'Market',
    market_overview_highlight: 'Overview',
    search_placeholder: 'SEARCH TIKR...',
    col_asset: 'Asset_Name',
    col_price: 'Last_Price',
    col_change: '24h_Chg%',
    col_high_low: 'High / Low',
    col_vol: '24h_Vol',
    col_action: 'Action',
    btn_trade: 'Trade',
    mark_price: 'Mark Price',
    change_24h: '24h Change',
    vol_24h: '24h Volume',
    order_book: 'ORDER BOOK',
    loading: 'LOADING DATA STREAM...',
    deriv_title: 'Perpetual',
    deriv_highlight: 'Contracts',
    earn_title: 'Crypto',
    earn_highlight: 'Earn',
    apy: 'Est. APY',
    duration: 'Duration',
    stake: 'Stake',
    funding: 'Funding / Countdown',
    open_interest: 'Open Interest',
    sys_ver: 'NEXUS PRIME TERMINAL // SYS.VER.3.0.1',
    latency: 'Latency: 12ms',
    server: 'Server: TOKYO_03',
    market_open: 'Market Open',
    net_stable: 'NET_V: STABLE',
    flexible: 'Flexible',
    days: 'Days',
    login_beta_msg: 'is currently in Invite-Only Beta mode.\nPlease try the "Trade" feature to view the dashboard.',
  },
  ru: {
    nav_markets: 'РЫНКИ',
    nav_trade: 'ТОРГОВЛЯ',
    nav_derivatives: 'ДЕРИВАТИВЫ',
    nav_earn: 'EARN',
    login: 'ВОЙТИ',
    register: 'РЕГИСТРАЦИЯ',
    market_overview: 'Обзор',
    market_overview_highlight: 'Рынка',
    search_placeholder: 'ПОИСК ТИКЕРА...',
    col_asset: 'Актив',
    col_price: 'Цена',
    col_change: '24ч Изм%',
    col_high_low: 'Макс / Мин',
    col_vol: '24ч Объём',
    col_action: 'Действие',
    btn_trade: 'Торговать',
    mark_price: 'Цена Маркировки',
    change_24h: 'Изм. 24ч',
    vol_24h: 'Объём 24ч',
    order_book: 'КНИГА ОРДЕРОВ',
    loading: 'ЗАГРУЗКА ДАННЫХ...',
    deriv_title: 'Бессрочные',
    deriv_highlight: 'Контракты',
    earn_title: 'Крипто',
    earn_highlight: 'Заработок',
    apy: 'Расч. APY',
    duration: 'Срок',
    stake: 'Стейкинг',
    funding: 'Фандинг / Таймер',
    open_interest: 'Открытый Интерес',
    sys_ver: 'ТЕРМИНАЛ NEXUS PRIME // ВЕР.3.0.1',
    latency: 'Задержка: 12мс',
    server: 'Сервер: ТОКИО_03',
    market_open: 'Рынок Открыт',
    net_stable: 'СЕТЬ: СТАБИЛЬНА',
    flexible: 'Гибкий',
    days: 'Дней',
    login_beta_msg: 'находится в режиме бета-тестирования по приглашениям.\nПожалуйста, используйте функцию "Торговля".',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => translations['en'][key] || key,
});

export const LanguageProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: keyof typeof translations['en']) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);