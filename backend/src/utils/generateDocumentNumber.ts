export const generateDocumentNumber = (type: string): string => {
  const prefix = type.substring(0, 3).toUpperCase();
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `${prefix}-${year}${month}-${random}`;
};

export const generateIncidentNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `INC-${year}-${random}`;
};

export const generateBlotterNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `BLT-${year}-${random}`;
};

export const generateRecordNumber = (type: string): string => {
  const prefix = type.substring(0, 3).toUpperCase();
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `${prefix}-${year}-${random}`;
};

export const generateHouseholdNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `HH-${year}-${random}`;
};



