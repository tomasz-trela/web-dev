export interface Author {
  id?: number | null;
  firstName: string;
  lastName: string;
}

export interface Book {
  id?: number | null;
  title: string;
  author: Author;
  pages: number | null;
}

export interface BookRequest {
  title: string;
  pages: number;
  authorId: number;
}
