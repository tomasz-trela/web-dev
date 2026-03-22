package pl.edu.pwr.ztw.books;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class Reader {
    private int id;
    private String firstName;
    private String lastName;
}
