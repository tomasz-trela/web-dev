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

export interface Reader {
  id?: number | null;
  firstName: string;
  lastName: string;
}

export interface Rental {
  id?: number | null;
  book: Book;
  reader: Reader;
  rentalDate: string;
  rentalDue: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
