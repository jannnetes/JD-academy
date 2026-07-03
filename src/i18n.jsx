import { createContext, useContext, useEffect, useState } from "react";

export const LOCALES = [
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "uk", flag: "🇺🇦", label: "Українська" },
  { code: "ru", flag: "🇷🇺", label: "Русский" },
  { code: "de", flag: "🇩🇪", label: "Deutsch" },
];

const messages = {
  en: {
    nav: { catalog: "Catalog", live: "Live Lessons", teachers: "Teachers", dashboard: "Dashboard", signIn: "Sign In", signOut: "SIGN OUT →", getStarted: "GET STARTED →" },
    hero: { kicker: "EDUCATION PLATFORM — EST. 2024", l1: "LEA", l1b: "RN", l2: "GROW", l3: "earn.", cta: "START LEARNING →", note: "10,000+ students already inside" },
    cats: { label: "DIRECTIONS", count: "directions" },
    courses: { label: "COURSES", h1: "POPULAR", h2: "COURSES", enroll: "ENROLL →", lessons: "lessons" },
    live: { label: "REAL-TIME", weekly: "LIVE LESSONS WEEKLY", updating: "Schedule updating…" },
    manifesto: { label: "PLATFORM", text1: "Education as a ", em: "system", text2: " — a clear goal, a personal path, a measurable result." },
    cta: { l1: "START", l2: "TODAY", student: "I'M A STUDENT →", teacher: "I'M A TEACHER →", copy: "© 2024 JD Learn — KNOWLEDGE WITHOUT BORDERS" },
    footer: { follow: "FOLLOW US", questions: "Questions? → @jd_learn_admin", rights: "© 2024 JD Learn. All rights reserved." },
    auth: { in1: "WELCOME", in2: "BACK", up1: "START", up2: "NOW", subIn: "Sign in to continue learning.", subUp: "Create your account in a minute.", email: "EMAIL", password: "PASSWORD", name: "NAME", youAre: "YOU ARE:", student: "STUDENT", teacher: "TEACHER", admin: "ADMIN", submitIn: "SIGN IN →", submitUp: "CREATE ACCOUNT →", noAcc: "No account? ", hasAcc: "Already have an account? ", signup: "Sign up", signin: "Sign in", demo: "DEMO ACCOUNT:", community: "JOIN OUR COMMUNITY" },
  },
  uk: {
    nav: { catalog: "Каталог", live: "Живі уроки", teachers: "Викладачі", dashboard: "Кабінет", signIn: "Увійти", signOut: "ВИЙТИ →", getStarted: "ПОЧАТИ →" },
    hero: { kicker: "ОСВІТНЯ ПЛАТФОРМА — ЗАСН. 2024", l1: "ВЧИ", l1b: "СЬ", l2: "ЗРОСТАЙ", l3: "заробляй.", cta: "ПОЧАТИ НАВЧАННЯ →", note: "10 000+ учнів уже всередині" },
    cats: { label: "НАПРЯМИ", count: "напрямів" },
    courses: { label: "КУРСИ", h1: "ПОПУЛЯРНІ", h2: "КУРСИ", enroll: "КУПИТИ →", lessons: "уроків" },
    live: { label: "У РЕАЛЬНОМУ ЧАСІ", weekly: "ЖИВІ УРОКИ ЩОТИЖНЯ", updating: "Розклад оновлюється…" },
    manifesto: { label: "ПЛАТФОРМА", text1: "Освіта як ", em: "система", text2: " — чітка ціль, персональний маршрут, вимірюваний результат." },
    cta: { l1: "ПОЧНИ", l2: "СЬОГОДНІ", student: "Я УЧЕНЬ →", teacher: "Я ВИКЛАДАЧ →", copy: "© 2024 JD Learn — ЗНАННЯ БЕЗ КОРДОНІВ" },
    footer: { follow: "СТЕЖТЕ ЗА НАМИ", questions: "Питання? → @jd_learn_admin", rights: "© 2024 JD Learn. Усі права захищені." },
    auth: { in1: "З ПОВЕР-", in2: "НЕННЯМ", up1: "ПОЧНИ", up2: "ЗАРАЗ", subIn: "Увійдіть, щоб продовжити навчання.", subUp: "Створіть акаунт за хвилину.", email: "EMAIL", password: "ПАРОЛЬ", name: "ІМ'Я", youAre: "ТИ Є:", student: "УЧЕНЬ", teacher: "ВИКЛАДАЧ", admin: "АДМІН", submitIn: "УВІЙТИ →", submitUp: "СТВОРИТИ АКАУНТ →", noAcc: "Немає акаунту? ", hasAcc: "Вже є акаунт? ", signup: "Зареєструватися", signin: "Увійти", demo: "ДЕМО АКАУНТ:", community: "ПРИЄДНУЙТЕСЬ ДО СПІЛЬНОТИ" },
  },
  ru: {
    nav: { catalog: "Каталог", live: "Живые уроки", teachers: "Преподаватели", dashboard: "Кабинет", signIn: "Войти", signOut: "ВЫЙТИ →", getStarted: "НАЧАТЬ →" },
    hero: { kicker: "ОБРАЗОВАТЕЛЬНАЯ ПЛАТФОРМА — ОСН. 2024", l1: "УЧИ", l1b: "СЬ", l2: "РАСТИ", l3: "зарабатывай.", cta: "НАЧАТЬ ОБУЧЕНИЕ →", note: "10 000+ учеников уже внутри" },
    cats: { label: "НАПРАВЛЕНИЯ", count: "направлений" },
    courses: { label: "КУРСЫ", h1: "ПОПУЛЯРНЫЕ", h2: "КУРСЫ", enroll: "КУПИТЬ →", lessons: "уроков" },
    live: { label: "В РЕАЛЬНОМ ВРЕМЕНИ", weekly: "ЖИВЫЕ УРОКИ ЕЖЕНЕДЕЛЬНО", updating: "Расписание обновляется…" },
    manifesto: { label: "ПЛАТФОРМА", text1: "Образование как ", em: "система", text2: " — чёткая цель, персональный маршрут, измеримый результат." },
    cta: { l1: "НАЧНИ", l2: "СЕГОДНЯ", student: "Я УЧЕНИК →", teacher: "Я ПРЕПОДАВАТЕЛЬ →", copy: "© 2024 JD Learn — ЗНАНИЯ БЕЗ ГРАНИЦ" },
    footer: { follow: "МЫ В СОЦСЕТЯХ", questions: "Вопросы? → @jd_learn_admin", rights: "© 2024 JD Learn. Все права защищены." },
    auth: { in1: "С ВОЗВРА-", in2: "ЩЕНИЕМ", up1: "НАЧНИ", up2: "СЕЙЧАС", subIn: "Войдите, чтобы продолжить обучение.", subUp: "Создайте аккаунт за минуту.", email: "EMAIL", password: "ПАРОЛЬ", name: "ИМЯ", youAre: "ТЫ:", student: "УЧЕНИК", teacher: "ПРЕПОДАВАТЕЛЬ", admin: "АДМИН", submitIn: "ВОЙТИ →", submitUp: "СОЗДАТЬ АККАУНТ →", noAcc: "Нет аккаунта? ", hasAcc: "Уже есть аккаунт? ", signup: "Зарегистрироваться", signin: "Войти", demo: "ДЕМО АККАУНТ:", community: "ПРИСОЕДИНЯЙТЕСЬ К СООБЩЕСТВУ" },
  },
  de: {
    nav: { catalog: "Katalog", live: "Live-Kurse", teachers: "Lehrer", dashboard: "Dashboard", signIn: "Anmelden", signOut: "ABMELDEN →", getStarted: "LOSLEGEN →" },
    hero: { kicker: "BILDUNGSPLATTFORM — SEIT 2024", l1: "LER", l1b: "NE", l2: "WACHSE", l3: "verdiene.", cta: "JETZT LERNEN →", note: "10.000+ Lernende sind bereits dabei" },
    cats: { label: "RICHTUNGEN", count: "Richtungen" },
    courses: { label: "KURSE", h1: "BELIEBTE", h2: "KURSE", enroll: "KAUFEN →", lessons: "Lektionen" },
    live: { label: "ECHTZEIT", weekly: "WÖCHENTLICHE LIVE-KURSE", updating: "Zeitplan wird aktualisiert…" },
    manifesto: { label: "PLATTFORM", text1: "Bildung als ", em: "System", text2: " — ein klares Ziel, ein persönlicher Weg, ein messbares Ergebnis." },
    cta: { l1: "STARTE", l2: "HEUTE", student: "ICH BIN SCHÜLER →", teacher: "ICH BIN LEHRER →", copy: "© 2024 JD Learn — WISSEN OHNE GRENZEN" },
    footer: { follow: "FOLGE UNS", questions: "Fragen? → @jd_learn_admin", rights: "© 2024 JD Learn. Alle Rechte vorbehalten." },
    auth: { in1: "WILL-", in2: "KOMMEN", up1: "STARTE", up2: "JETZT", subIn: "Melde dich an, um weiterzulernen.", subUp: "Erstelle dein Konto in einer Minute.", email: "E-MAIL", password: "PASSWORT", name: "NAME", youAre: "DU BIST:", student: "SCHÜLER", teacher: "LEHRER", admin: "ADMIN", submitIn: "ANMELDEN →", submitUp: "KONTO ERSTELLEN →", noAcc: "Kein Konto? ", hasAcc: "Schon ein Konto? ", signup: "Registrieren", signin: "Anmelden", demo: "DEMO-KONTO:", community: "TRITT UNSERER COMMUNITY BEI" },
  },
};

const KEY = "jdlearn_locale";
const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(() => localStorage.getItem(KEY) || "en");
  useEffect(() => {
    localStorage.setItem(KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  function t(path) {
    const parts = path.split(".");
    let node = messages[locale] || messages.en;
    let fallback = messages.en;
    for (const p of parts) {
      node = node?.[p];
      fallback = fallback?.[p];
    }
    return node ?? fallback ?? path;
  }

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
