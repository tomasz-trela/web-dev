package pl.edu.pwr.ztw.books.service;

import java.util.Collection;

import pl.edu.pwr.ztw.books.model.Book;

public interface IBooksService {
    Collection<Book> getBooks();
    Book getBook(int id);
    Book addBook(Book book);
    Book updateBook(int id, Book book);
    boolean deleteBook(int id);
}