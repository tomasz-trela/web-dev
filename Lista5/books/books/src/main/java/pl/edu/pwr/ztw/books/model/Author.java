package pl.edu.pwr.ztw.books.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class Author {
    private int id;
    private String firstName;
    private String lastName;
}