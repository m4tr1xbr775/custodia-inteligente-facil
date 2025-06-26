
export const getPrisonUnitTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    'UPR': 'UPR - Unidade Prisional Regional',
    'CPP': 'CPP - Casa de Prisão Provisória',
    'Presídio Estadual': 'Presídio Estadual',
    'Penitenciária Feminina': 'Penitenciária Feminina',
    // Manter compatibilidade com valores antigos
    'Presídio': 'Presídio Estadual',
    'CDP': 'CPP - Casa de Prisão Provisória'
  };
  
  return typeMap[type] || type;
};

export const getPrisonUnitTypeBadgeColor = (type: string): string => {
  switch (type) {
    case 'UPR':
      return 'bg-blue-100 text-blue-800';
    case 'CPP':
      return 'bg-green-100 text-green-800';
    case 'Presídio Estadual':
      return 'bg-orange-100 text-orange-800';
    case 'Penitenciária Feminina':
      return 'bg-purple-100 text-purple-800';
    // Compatibilidade com valores antigos
    case 'Presídio':
      return 'bg-orange-100 text-orange-800';
    case 'CDP':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
