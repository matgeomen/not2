export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}