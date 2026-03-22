package pl.edu.pwr.ztw.books;

import java.util.Collection;

public interface IAuthorsService {
    Collection<Author> getAuthors();
    Author getAuthor(int id);
    Author addAuthor(Author author);
    Author updateAuthor(int id, Author author);
    boolean deleteAuthor(int id);
}