package pl.edu.pwr.ztw.books.service;

import java.util.Collection;

import pl.edu.pwr.ztw.books.model.Rental;

public interface IRentalsService {
    Collection<Rental> getRentals();
    Rental getRental(int id);
    Rental rentBook(int bookId, int readerId);
    boolean returnBook(int rentalId);
    void deleteRentalsByBook(int bookId);
    void deleteRentalsByReader(int readerId);
}
