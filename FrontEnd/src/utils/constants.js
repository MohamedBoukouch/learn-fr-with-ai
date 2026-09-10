export const LEVEL_COLORS = {
  'Pre-A1': {
    primary: '#EC4899', // Pink
    bg: 'bg-pink-50',
    border: 'border-pink-100',
    text: 'text-pink-600',
    button: 'bg-pink-600 hover:bg-pink-700',
    badge: 'bg-pink-100 text-pink-600'
  },
  'A1': {
    primary: '#3B82F6', // Blue
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    text: 'text-blue-600',
    button: 'bg-blue-600 hover:bg-blue-700',
    badge: 'bg-blue-100 text-blue-600'
  },
  'A2': {
    primary: '#10B981', // Green
    bg: 'bg-green-50',
    border: 'border-green-100',
    text: 'text-green-600',
    button: 'bg-green-600 hover:bg-green-700',
    badge: 'bg-green-100 text-green-600'
  },
  'B1': {
    primary: '#F59E0B', // Amber
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    text: 'text-amber-600',
    button: 'bg-amber-600 hover:bg-amber-700',
    badge: 'bg-amber-100 text-amber-600'
  },
  'B2': {
    primary: '#F97316', // Orange
    bg: 'bg-orange-50',
    border: 'border-orange-100',
    text: 'text-orange-600',
    button: 'bg-orange-600 hover:bg-orange-700',
    badge: 'bg-orange-100 text-orange-600'
  },
  'C1': {
    primary: '#8B5CF6', // Purple
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    text: 'text-purple-600',
    button: 'bg-purple-600 hover:bg-purple-700',
    badge: 'bg-purple-100 text-purple-600'
  },
  'C2': {
    primary: '#6366F1', // Indigo
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    text: 'text-indigo-600',
    button: 'bg-indigo-600 hover:bg-indigo-700',
    badge: 'bg-indigo-100 text-indigo-600'
  },
  'DEFAULT': {
    primary: '#6B7280', // Gray
    bg: 'bg-gray-50',
    border: 'border-gray-100',
    text: 'text-gray-600',
    button: 'bg-gray-600 hover:bg-gray-700',
    badge: 'bg-gray-100 text-gray-600'
  }
};

export const getLevelStyle = (levelName) => {
  return LEVEL_COLORS[levelName] || LEVEL_COLORS['DEFAULT'];
};
