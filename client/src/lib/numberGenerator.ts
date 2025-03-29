import { format } from 'date-fns';

// Generate a unique inspection number
export const generateInspectionNumber = (): string => {
  const date = format(new Date(), 'yyyy-MM');
  const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INS-${date}-${randomPart}`;
};

// Generate a unique breach number
export const generateBreachNumber = (): string => {
  const date = format(new Date(), 'yyyy-MM');
  const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `BRE-${date}-${randomPart}`;
};

// Generate a unique investigation number
export const generateInvestigationNumber = (): string => {
  const date = format(new Date(), 'yyyy-MM');
  const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${date}-${randomPart}`;
};
