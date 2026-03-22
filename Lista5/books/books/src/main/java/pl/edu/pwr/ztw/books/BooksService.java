package pl.edu.pwr.ztw.books;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BooksService implements IBooksService, org.springframework.beans.factory.InitializingBean {

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
    public Book addBook(Book book) {
        book.setId(nextId++);
        booksRepo.add(book);
        return book;
    }

    @Override
    public Book updateBook(int id, Book book) {
        Book existing = getBook(id);
        if (existing == null) return null;
        existing.setTitle(book.getTitle());
        existing.setAuthor(book.getAuthor());
        existing.setPages(book.getPages());
        return existing;
    }

    @Override
    public boolean deleteBook(int id) {
        return booksRepo.removeIf(b -> b.getId() == id);
    }
}