package pl.edu.pwr.ztw.books.service;

import java.util.Collection;

import pl.edu.pwr.ztw.books.model.Book;
import pl.edu.pwr.ztw.books.model.BookRequest;

public interface IBooksService {
    Collection<Book> getBooks();
    Book getBook(int id);
    Book addBook(BookRequest request);
    Book updateBook(int id, BookRequest request);
    boolean deleteBook(int id);
    void deleteBooksByAuthor(int authorId);
}
