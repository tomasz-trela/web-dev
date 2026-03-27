package pl.edu.pwr.ztw.books.service.impl;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.stereotype.Service;

import pl.edu.pwr.ztw.books.model.Author;
import pl.edu.pwr.ztw.books.model.Book;
import pl.edu.pwr.ztw.books.model.BookRequest;
import pl.edu.pwr.ztw.books.service.IBooksService;

@Service
public class BooksService implements IBooksService, InitializingBean {

    @Autowired
    private AuthorsService authorsService;

    private static List<Book> booksRepo = new ArrayList<>();
    private static int nextId = 4;

    @Override
    public void afterPropertiesSet() {
        Author author1 = authorsService.getAuthor(1);
        Author author2 = authorsService.getAuthor(2);
        Author author3 = authorsService.getAuthor(3);
        booksRepo.add(new Book(1, "Potop", author1, 936));
        booksRepo.add(new Book(2, "Wesele", author2, 150));
        booksRepo.add(new Book(3, "Dziady", author3, 292));
    }

    @Override
    public Collection<Book> getBooks() {
        return booksRepo;
    }

    @Override
    public Book getBook(int id) {
        return booksRepo.stream()
                .filter(b -> b.getId() == id)
                .findAny()
                .orElse(null);
    }

    @Override
    public Book addBook(BookRequest request) {
        Author author = authorsService.getAuthor(request.getAuthorId());
        if (author == null) return null;
        Book book = new Book(nextId++, request.getTitle(), author, request.getPages());
        booksRepo.add(book);
        return book;
    }

    @Override
    public Book updateBook(int id, BookRequest request) {
        Book existing = getBook(id);
        if (existing == null) return null;
        Author author = authorsService.getAuthor(request.getAuthorId());
        if (author == null) return null;
        existing.setTitle(request.getTitle());
        existing.setPages(request.getPages());
        existing.setAuthor(author);
        return existing;
    }

    @Override
    public boolean deleteBook(int id) {
        return booksRepo.removeIf(b -> b.getId() == id);
    }

    @Override
    public void deleteBooksByAuthor(int authorId) {
        booksRepo.removeIf(b -> b.getAuthor() != null && b.getAuthor().getId() == authorId);
    }
}
