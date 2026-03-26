package pl.edu.pwr.ztw.books.model;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class Rental {
    private int id;
    private Book book;
    private Reader reader;
    private LocalDate rentalDate;
    private LocalDate rentalDue;
}