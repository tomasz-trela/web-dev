package pl.edu.pwr.ztw.books.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class BookRequest {
    private String title;
    private int pages;
    private int authorId;
}
