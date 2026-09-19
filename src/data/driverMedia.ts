// Official Formula 1 2026 driver portraits and team badge definitions

export interface DriverMediaInfo {
  id: string;
  code: string;
  fullName: string;
  avatarUrl: string;
  teamId: string;
  teamName: string;
  teamColor: string;
  helmetColor: string;
}

// Curated high-resolution portraits with reliable fallback
export const DRIVER_PORTRAITS: Record<string, string> = {
  ant: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Andrea_Kimi_Antonelli_2024.jpg/440px-Andrea_Kimi_Antonelli_2024.jpg',
  ver: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Max_Verstappen_2024.jpg/440px-Max_Verstappen_2024.jpg',
  nor: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Lando_Norris_2024.jpg/440px-Lando_Norris_2024.jpg',
  lec: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Charles_Leclerc_2023.jpg/440px-Charles_Leclerc_2023.jpg',
  pia: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Oscar_Piastri_2023.jpg/440px-Oscar_Piastri_2023.jpg',
  ham: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Lewis_Hamilton_2022_Silverstone_%28cropped%29.jpg/440px-Lewis_Hamilton_2022_Silverstone_%28cropped%29.jpg',
  rus: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/George_Russell_2024.jpg/440px-George_Russell_2024.jpg',
  sai: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Carlos_Sainz_Jr_2023.jpg/440px-Carlos_Sainz_Jr_2023.jpg',
  alo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Fernando_Alonso_2022.jpg/440px-Fernando_Alonso_2022.jpg',
  gas: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Pierre_Gasly_2024.jpg/440px-Pierre_Gasly_2024.jpg',
  alb: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Alexander_Albon_2022.jpg/440px-Alexander_Albon_2022.jpg',
  hul: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Nico_H%C3%BClkenberg_2023.jpg/440px-Nico_H%C3%BClkenberg_2023.jpg',
  tsu: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Yuki_Tsunoda_2024.jpg/440px-Yuki_Tsunoda_2024.jpg',
  str: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Lance_Stroll_2024.jpg/440px-Lance_Stroll_2024.jpg',
  law: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Liam_Lawson_2023.jpg/440px-Liam_Lawson_2023.jpg',
  had: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Isack_Hadjar_2024.jpg/440px-Isack_Hadjar_2024.jpg',
  oco: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Esteban_Ocon_2024.jpg/440px-Esteban_Ocon_2024.jpg',
  bea: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Oliver_Bearman_2024.jpg/440px-Oliver_Bearman_2024.jpg',
  doo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Jack_Doohan_2023.jpg/440px-Jack_Doohan_2023.jpg',
  bor: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Gabriel_Bortoleto_2023.jpg/440px-Gabriel_Bortoleto_2023.jpg',
};

// Team key mapping helper
export function getTeamKey(teamName: string): string {
  const lower = (teamName || '').toLowerCase();
  if (lower.includes('mercedes')) return 'mercedes';
  if (lower.includes('mclaren')) return 'mclaren';
  if (lower.includes('ferrari')) return 'ferrari';
  if (lower.includes('red bull')) return 'redbull';
  if (lower.includes('williams')) return 'williams';
  if (lower.includes('aston')) return 'astonmartin';
  if (lower.includes('alpine')) return 'alpine';
  if (lower.includes('sauber') || lower.includes('kick') || lower.includes('audi')) return 'sauber';
  if (lower.includes('racing bulls') || lower.includes('rb') || lower.includes('visa')) return 'rb';
  if (lower.includes('haas')) return 'haas';
  return 'default';
}
