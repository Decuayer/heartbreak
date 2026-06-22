/**
 * Sunucu tarafında UTC zaman damgasına dayalı tarih hesaplamaları
 * Kullanıcının yerel saatinden bağımsız çalışır
 */

/**
 * Başlangıç tarihinden bu yana geçen tam gün sayısını hesaplar (UTC)
 */
export function getDaysSince(startDateStr: string): number {
  const start = new Date(startDateStr + "T00:00:00.000Z");
  const now = new Date();
  const nowUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );
  const startUtc = Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth(),
    start.getUTCDate()
  );
  return Math.max(0, Math.floor((nowUtc - startUtc) / (1000 * 60 * 60 * 24)));
}

/**
 * Verilen tarihin geçip geçmediğini kontrol eder (UTC)
 */
export function isDatePassed(targetDateStr: string): boolean {
  const target = new Date(targetDateStr + "T00:00:00.000Z");
  const nowUtc = Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate()
  );
  const targetUtc = Date.UTC(
    target.getUTCFullYear(),
    target.getUTCMonth(),
    target.getUTCDate()
  );
  return nowUtc >= targetUtc;
}

/**
 * Hedef tarihe kadar kalan süreyi döndürür (ms)
 */
export function msUntilDate(targetDateStr: string): number {
  const target = new Date(targetDateStr + "T00:00:00.000Z");
  return Math.max(0, target.getTime() - Date.now());
}

/**
 * Gün sayısını insan dostu formata çevirir
 */
export function formatDuration(days: number): {
  years: number;
  months: number;
  days: number;
} {
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const remainingDays = days % 30;
  return { years, months, days: remainingDays };
}
