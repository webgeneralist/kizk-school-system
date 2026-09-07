export type Department = "小中等部" | "高等部";

export function getGrades(dept: Department): string[] {
  if (dept === "高等部") return ["高校1年", "高校2年", "高校3年"];
  return [
    "小学1年", "小学2年", "小学3年", "小学4年", "小学5年", "小学6年",
    "中学1年", "中学2年", "中学3年",
  ];
}

export function getSubjects(dept: Department): string[] {
  if (dept === "高等部") {
    return [
      "現代文", "古典", "数学Ⅰ", "数学A", "数学Ⅱ", "数学B",
      "英語コミュニケーション", "論理表現", "物理基礎", "化学基礎",
      "生物基礎", "地理総合", "歴史総合", "公共", "情報Ⅰ", "家庭基礎", "その他",
    ];
  }
  return ["算数", "国語", "理科", "社会", "英語", "生活", "図工", "音楽", "体育", "その他"];
}
