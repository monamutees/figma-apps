// Sport categories based on age groups and skill levels
export interface SportCategory {
  id: string;
  name: string;
  description: string;
  ageRange?: string;
}

export const SPORT_CATEGORIES: Record<string, SportCategory[]> = {
  'Voleibol': [
    { id: 'mini', name: 'Mini Voleibol', description: 'Niños 6-10 años', ageRange: '6-10' },
    { id: 'infantil', name: 'Infantil', description: 'Niños 11-12 años', ageRange: '11-12' },
    { id: 'cadete', name: 'Cadete', description: 'Niños 13-14 años', ageRange: '13-14' },
    { id: 'juvenil', name: 'Juvenil', description: 'Niños 15-16 años', ageRange: '15-16' },
    { id: 'junior', name: 'Junior', description: 'Niños 17-18 años', ageRange: '17-18' },
    { id: 'senior', name: 'Senior', description: 'Adultos 19+ años', ageRange: '19+' },
    { id: 'recreativo', name: 'Recreativo', description: 'Cualquier edad', ageRange: 'Todas' }
  ],
  'Baloncesto': [
    { id: 'mini', name: 'Mini Basket', description: 'Niños 6-9 años', ageRange: '6-9' },
    { id: 'prebenjamin', name: 'Prebenjamín', description: 'Niños 8-9 años', ageRange: '8-9' },
    { id: 'benjamin', name: 'Benjamín', description: 'Niños 10-11 años', ageRange: '10-11' },
    { id: 'alevin', name: 'Alevín', description: 'Niños 12-13 años', ageRange: '12-13' },
    { id: 'infantil', name: 'Infantil', description: 'Niños 14-15 años', ageRange: '14-15' },
    { id: 'cadete', name: 'Cadete', description: 'Niños 16-17 años', ageRange: '16-17' },
    { id: 'junior', name: 'Junior', description: 'Niños 18-19 años', ageRange: '18-19' },
    { id: 'senior', name: 'Senior', description: 'Adultos 20+ años', ageRange: '20+' },
    { id: 'recreativo', name: 'Recreativo', description: 'Cualquier edad', ageRange: 'Todas' }
  ],
  'Fútbol': [
    { id: 'futbol7', name: 'Fútbol 7', description: 'Niños 6-8 años', ageRange: '6-8' },
    { id: 'prebenjamin', name: 'Prebenjamín', description: 'Niños 8-9 años', ageRange: '8-9' },
    { id: 'benjamin', name: 'Benjamín', description: 'Niños 10-11 años', ageRange: '10-11' },
    { id: 'alevin', name: 'Alevín', description: 'Niños 12-13 años', ageRange: '12-13' },
    { id: 'infantil', name: 'Infantil', description: 'Niños 14-15 años', ageRange: '14-15' },
    { id: 'cadete', name: 'Cadete', description: 'Niños 16-17 años', ageRange: '16-17' },
    { id: 'juvenil', name: 'Juvenil', description: 'Niños 18-19 años', ageRange: '18-19' },
    { id: 'senior', name: 'Senior', description: 'Adultos 20+ años', ageRange: '20+' },
    { id: 'recreativo', name: 'Recreativo', description: 'Cualquier edad', ageRange: 'Todas' }
  ],
  'Tenis': [
    { id: 'roja', name: 'Pelota Roja', description: 'Niños 5-8 años', ageRange: '5-8' },
    { id: 'naranja', name: 'Pelota Naranja', description: 'Niños 8-10 años', ageRange: '8-10' },
    { id: 'verde', name: 'Pelota Verde', description: 'Niños 10-12 años', ageRange: '10-12' },
    { id: 'amarilla', name: 'Pelota Amarilla', description: 'Niños 12+ años', ageRange: '12+' },
    { id: 'infantil', name: 'Infantil', description: 'Niños 12-14 años', ageRange: '12-14' },
    { id: 'cadete', name: 'Cadete', description: 'Niños 14-16 años', ageRange: '14-16' },
    { id: 'juvenil', name: 'Juvenil', description: 'Niños 16-18 años', ageRange: '16-18' },
    { id: 'senior', name: 'Senior', description: 'Adultos 18+ años', ageRange: '18+' },
    { id: 'recreativo', name: 'Recreativo', description: 'Cualquier edad', ageRange: 'Todas' }
  ],
  'Béisbol': [
    { id: 'teeball', name: 'Tee Ball', description: 'Niños 4-6 años', ageRange: '4-6' },
    { id: 'rookie', name: 'Rookie', description: 'Niños 6-8 años', ageRange: '6-8' },
    { id: 'minor', name: 'Minor', description: 'Niños 8-10 años', ageRange: '8-10' },
    { id: 'major', name: 'Major', description: 'Niños 10-12 años', ageRange: '10-12' },
    { id: 'junior', name: 'Junior', description: 'Niños 13-14 años', ageRange: '13-14' },
    { id: 'senior', name: 'Senior', description: 'Niños 15+ años', ageRange: '15+' },
    { id: 'recreativo', name: 'Recreativo', description: 'Cualquier edad', ageRange: 'Todas' }
  ],
  'Natación': [
    { id: 'escuela', name: 'Escuela', description: 'Niños 4-8 años', ageRange: '4-8' },
    { id: 'benjamín', name: 'Benjamín', description: 'Niños 8-10 años', ageRange: '8-10' },
    { id: 'alevin', name: 'Alevín', description: 'Niños 10-12 años', ageRange: '10-12' },
    { id: 'infantil', name: 'Infantil', description: 'Niños 12-14 años', ageRange: '12-14' },
    { id: 'cadete', name: 'Cadete', description: 'Niños 14-16 años', ageRange: '14-16' },
    { id: 'juvenil', name: 'Juvenil', description: 'Niños 16-18 años', ageRange: '16-18' },
    { id: 'senior', name: 'Senior', description: 'Adultos 18+ años', ageRange: '18+' },
    { id: 'master', name: 'Master', description: 'Adultos 25+ años', ageRange: '25+' },
    { id: 'recreativo', name: 'Recreativo', description: 'Cualquier edad', ageRange: 'Todas' }
  ],
  'Atletismo': [
    { id: 'escuela', name: 'Escuela', description: 'Niños 6-10 años', ageRange: '6-10' },
    { id: 'benjamín', name: 'Benjamín', description: 'Niños 10-12 años', ageRange: '10-12' },
    { id: 'alevin', name: 'Alevín', description: 'Niños 12-14 años', ageRange: '12-14' },
    { id: 'infantil', name: 'Infantil', description: 'Niños 14-16 años', ageRange: '14-16' },
    { id: 'cadete', name: 'Cadete', description: 'Niños 16-18 años', ageRange: '16-18' },
    { id: 'juvenil', name: 'Juvenil', description: 'Niños 18-20 años', ageRange: '18-20' },
    { id: 'promesa', name: 'Promesa', description: 'Niños 20-23 años', ageRange: '20-23' },
    { id: 'senior', name: 'Senior', description: 'Adultos 23+ años', ageRange: '23+' },
    { id: 'master', name: 'Master', description: 'Adultos 35+ años', ageRange: '35+' },
    { id: 'recreativo', name: 'Recreativo', description: 'Cualquier edad', ageRange: 'Todas' }
  ],
  'Otro': [
    { id: 'infantil', name: 'Infantil', description: 'Niños 6-12 años', ageRange: '6-12' },
    { id: 'juvenil', name: 'Juvenil', description: 'Niños 13-17 años', ageRange: '13-17' },
    { id: 'senior', name: 'Senior', description: 'Adultos 18+ años', ageRange: '18+' },
    { id: 'recreativo', name: 'Recreativo', description: 'Cualquier edad', ageRange: 'Todas' }
  ]
};

export const getCategoriesForSport = (sport: string): SportCategory[] => {
  return SPORT_CATEGORIES[sport] || SPORT_CATEGORIES['Otro'];
};

export const getCategoryById = (sport: string, categoryId: string): SportCategory | undefined => {
  const categories = getCategoriesForSport(sport);
  return categories.find(category => category.id === categoryId);
};

export const getDefaultCategory = (sport: string): SportCategory => {
  const categories = getCategoriesForSport(sport);
  return categories.find(cat => cat.id === 'recreativo') || categories[0];
};