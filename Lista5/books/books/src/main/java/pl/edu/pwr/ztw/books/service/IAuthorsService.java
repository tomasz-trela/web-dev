package pl.edu.pwr.ztw.books.service;

import java.util.Collection;

import pl.edu.pwr.ztw.books.model.Author;

public interface IAuthorsService {
    Collection<Author> getAuthors();
    Author getAuthor(int id);
    Author addAuthor(Author author);
    Author updateAuthor(int id, Author author);
    boolean deleteAuthor(int id);
}