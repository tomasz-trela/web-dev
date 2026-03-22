package pl.edu.pwr.ztw.books;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Service
public class BooksService implements IBooksService {

    private static List<Book> booksRepo = new ArrayList<>();
    private static int nextId = 4;

    static {
        Author author1 = new Author(1, "Henryk", "Sienkiewicz");
        Author author2 = new Author(2, "Stanisław", "Wyspiański");
        Author author3 = new Author(3, "Adam", "Mickiewicz");
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