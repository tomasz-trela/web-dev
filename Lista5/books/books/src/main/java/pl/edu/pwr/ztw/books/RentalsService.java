package pl.edu.pwr.ztw.books;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

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
        Rental rental = new Rental(nextId++, book, readerName,
                LocalDate.now().toString());
        rentalsRepo.add(rental);
        return rental;
    }

    @Override
    public boolean returnBook(int rentalId) {
        return rentalsRepo.removeIf(r -> r.getId() == rentalId);
    }
}