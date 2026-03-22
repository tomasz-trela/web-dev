package pl.edu.pwr.ztw.books;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class Book {
    private int id;
    private String title;
    private String author;
    private int pages;
}