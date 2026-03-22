package pl.edu.pwr.ztw.books;

import java.util.Collection;

public interface IRentalsService {
    Collection<Rental> getRentals();
    Rental getRental(int id);
    Rental rentBook(int bookId, String readerName);
    boolean returnBook(int rentalId);
}