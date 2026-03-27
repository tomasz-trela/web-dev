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
    private static int nextId = 18;

    @Override
    public void afterPropertiesSet() {
        Author author1 = authorsService.getAuthor(1);
        Author author2 = authorsService.getAuthor(2);
        Author author3 = authorsService.getAuthor(3);
        Author author4 = authorsService.getAuthor(4);
        Author author5 = authorsService.getAuthor(5);
        Author author6 = authorsService.getAuthor(6);
        Author author7 = authorsService.getAuthor(7);
        Author author8 = authorsService.getAuthor(8);
        Author author9 = authorsService.getAuthor(9);
        Author author10 = authorsService.getAuthor(10);
        booksRepo.add(new Book(1, "Potop", author1, 936));
        booksRepo.add(new Book(2, "Wesele", author2, 150));
        booksRepo.add(new Book(3, "Dziady", author3, 292));
        booksRepo.add(new Book(4, "Lalka", author4, 654));
        booksRepo.add(new Book(5, "Nad Niemnem", author5, 480));
        booksRepo.add(new Book(6, "Kordian", author6, 210));
        booksRepo.add(new Book(7, "Rota", author7, 60));
        booksRepo.add(new Book(8, "Zemsta", author8, 120));
        booksRepo.add(new Book(9, "Syzyfowe prace", author9, 320));
        booksRepo.add(new Book(10, "Moralność pani Dulskiej", author10, 140));
        booksRepo.add(new Book(11, "Faraon", author4, 520));
        booksRepo.add(new Book(12, "Gloria victis", author5, 90));
        booksRepo.add(new Book(13, "Balladyna", author6, 180));
        booksRepo.add(new Book(14, "O krasnoludkach i sierotce Marysi", author7, 200));
        booksRepo.add(new Book(15, "Pan Jowialski", author8, 110));
        booksRepo.add(new Book(16, "Przedwiośnie", author9, 400));
        booksRepo.add(new Book(17, "Ich czworo", author10, 130));
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
