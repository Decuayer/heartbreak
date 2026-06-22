/**
 * Türkçe karakter normalizasyonu
 * Quiz cevaplarını sunucuya göndermeden önce standartlaştırmak için
 */

const TURKISH_MAP: Record<string, string> = {
  ş: "s",
  ğ: "g",
  ü: "u",
  ö: "o",
  ı: "i",
  ç: "c",
  Ş: "s",
  Ğ: "g",
  Ü: "u",
  Ö: "o",
  İ: "i",
  Ç: "c",
};

/**
 * Metni normalize eder:
 * 1. Baştaki/sondaki boşlukları temizler
 * 2. Küçük harfe çevirir
 * 3. Türkçe karakterleri ASCII karşılığına dönüştürür
 * 4. Birden fazla boşluğu tekli boşluğa indirger
 */
export function normalizeTurkish(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[şğüöıçŞĞÜÖİÇ]/g, (char) => TURKISH_MAP[char] ?? char)
    .replace(/\s+/g, " ");
}

/**
 * İki Türkçe metni normalize ederek karşılaştırır
 */
export function compareTurkish(a: string, b: string): boolean {
  return normalizeTurkish(a) === normalizeTurkish(b);
}
