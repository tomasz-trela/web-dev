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
import pl.edu.pwr.ztw.books.service.IRentalsService;

@Service
public class RentalsService implements IRentalsService {

    @Autowired
    IBooksService booksService;

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
    public Rental rentBook(int bookId, String readerName) {
        Book book = booksService.getBook(bookId);
        if (book == null) return null;
        String[] nameParts = readerName.split(" ", 2);
        String firstName = nameParts.length > 0 ? nameParts[0] : "";
        String lastName = nameParts.length > 1 ? nameParts[1] : "";
        Reader reader = new Reader(nextId, firstName, lastName);
        LocalDate now = LocalDate.now();
        LocalDate due = now.plusWeeks(2); 
        Rental rental = new Rental(nextId++, book, reader, now, due);
        rentalsRepo.add(rental);
        return rental;
    }

    @Override
    public boolean returnBook(int rentalId) {
        return rentalsRepo.removeIf(r -> r.getId() == rentalId);
    }
}