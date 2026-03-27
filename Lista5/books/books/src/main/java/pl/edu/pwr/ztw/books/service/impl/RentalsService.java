package pl.edu.pwr.ztw.books.service.impl;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pl.edu.pwr.ztw.books.model.Book;
import pl.edu.pwr.ztw.books.model.Reader;
import pl.edu.pwr.ztw.books.model.Rental;
import pl.edu.pwr.ztw.books.service.IBooksService;
import pl.edu.pwr.ztw.books.service.IReadersService;
import pl.edu.pwr.ztw.books.service.IRentalsService;

@Service
public class RentalsService implements IRentalsService {

    @Autowired
    IBooksService booksService;

    @Autowired
    IReadersService readersService;

    private static List<Rental> rentalsRepo = new ArrayList<>();
    private static int nextId = 1;

    @Override
    public Collection<Rental> getRentals() {
        return rentalsRepo;
    }

    @Override
    public Rental getRental(int id) {
        return rentalsRepo.stream()
                .filter(r -> r.getId() == id)
                .findAny()
                .orElse(null);
    }

    @Override
    public Rental rentBook(int bookId, int readerId) {
        Book book = booksService.getBook(bookId);
        if (book == null) return null;
        Reader reader = readersService.getReader(readerId);
        if (reader == null) return null;
        LocalDate now = LocalDate.now();
        Rental rental = new Rental(nextId++, book, reader, now, now.plusWeeks(2));
        rentalsRepo.add(rental);
        return rental;
    }

    @Override
    public boolean returnBook(int rentalId) {
        return rentalsRepo.removeIf(r -> r.getId() == rentalId);
    }

    @Override
    public void deleteRentalsByBook(int bookId) {
        rentalsRepo.removeIf(r -> r.getBook().getId() == bookId);
    }

    @Override
    public void deleteRentalsByReader(int readerId) {
        rentalsRepo.removeIf(r -> r.getReader().getId() == readerId);
    }
}
