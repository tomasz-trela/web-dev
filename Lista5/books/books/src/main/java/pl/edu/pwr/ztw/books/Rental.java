package pl.edu.pwr.ztw.books;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class Rental {
    private int id;
    private Book book;
    private String readerName;
    private String rentalDate;
}