const NAV_LINKS: { href: string; label: string }[] = [
  { href: "/students", label: "生徒一覧" },
  { href: "/attendance", label: "出欠管理" },
  { href: "/schools", label: "学校管理" },
  { href: "/calendar", label: "カレンダー" },
  { href: "/worksheets", label: "教材ライブラリ" },
  { href: "/assignments", label: "課題・採点" },
  { href: "/weakpoints", label: "苦手管理" },
  { href: "/progress", label: "学習進捗" },
  { href: "/levels", label: "科目レベル" },
  { href: "/hs-reports", label: "高校レポート" },
  { href: "/messages", label: "連絡・メッセージ" },
  { href: "/reports", label: "月次レポート送信" },
  { href: "/todos", label: "やることリスト" },
  { href: "/sns", label: "SNS投稿ネタ" },
  { href: "/academies", label: "学院管理" },
  { href: "/users", label: "スタッフ管理" },
  { href: "/settings/api", label: "API設定" },
];

export default function AppHeader({
  title,
  currentPath,
  userEmail,
}: {
  title: string;
  currentPath: string;
  userEmail?: string;
}) {
  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">{title}</h1>
          <p className="text-xs opacity-80">KIZK.jp 学院支援システム（Supabase版）</p>
        </div>
        {userEmail && <span className="text-sm opacity-90">{userEmail}</span>}
      </div>
      <nav className="px-6 pb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {NAV_LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className={`underline-offset-2 ${
              currentPath === l.href ? "font-bold underline" : "opacity-80 hover:opacity-100 hover:underline"
            }`}
          >
            {l.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
