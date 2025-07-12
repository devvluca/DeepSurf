// Script de migração para adicionar cores às pranchas existentes
export const migrateBoards = (boards: any[]): any[] => {
  if (!Array.isArray(boards)) {
    return [];
  }
  
  return boards.map(board => ({
    ...board,
    // Adicionar cor padrão se não existir
    color: board.color || '#3b82f6',
    // Garantir que todos os campos obrigatórios existem
    id: board.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name: board.name || 'Prancha',
    length: board.length || '6\'0"',
    volume: board.volume || '30L'
  }));
};

// Função para migrar dados do localStorage
export const migrateLocalStorageBoards = (userId: string): any[] => {
  try {
    const savedBoards = localStorage.getItem(`user_boards_${userId}`);
    if (!savedBoards) {
      return [];
    }
    
    const boards = JSON.parse(savedBoards);
    const migratedBoards = migrateBoards(boards);
    
    // Salvar de volta a versão migrada
    localStorage.setItem(`user_boards_${userId}`, JSON.stringify(migratedBoards));
    
    console.log('Boards migrados com sucesso:', migratedBoards);
    return migratedBoards;
  } catch (error) {
    console.error('Erro ao migrar boards do localStorage:', error);
    return [];
  }
};
