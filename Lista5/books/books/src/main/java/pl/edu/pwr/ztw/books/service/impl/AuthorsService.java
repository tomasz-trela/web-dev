package pl.edu.pwr.ztw.books.service.impl;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import pl.edu.pwr.ztw.books.model.Author;
import pl.edu.pwr.ztw.books.service.IAuthorsService;

@Service
public class AuthorsService implements IAuthorsService {

    private static List<Author> authorsRepo = new ArrayList<>();
    private static int nextId = 4;

    static {
        authorsRepo.add(new Author(1, "Henryk", "Sienkiewicz"));
        authorsRepo.add(new Author(2, "Stanisław", "Wyspiański"));
        authorsRepo.add(new Author(3, "Adam", "Mickiewicz"));
        authorsRepo.add(new Author(4, "Bolesław", "Prus"));
        authorsRepo.add(new Author(5, "Eliza", "Orzeszkowa"));
        authorsRepo.add(new Author(6, "Juliusz", "Słowacki"));
        authorsRepo.add(new Author(7, "Maria", "Konopnicka"));
        authorsRepo.add(new Author(8, "Aleksander", "Fredro"));
        authorsRepo.add(new Author(9, "Stefan", "Żeromski"));
        authorsRepo.add(new Author(10, "Gabriela", "Zapolska"));
    }

    @Override
    public Collection<Author> getAuthors() {
        return authorsRepo;
    }

    @Override
    public Author getAuthor(int id) {
        return authorsRepo.stream()
                .filter(a -> a.getId() == id)
                .findAny()
                .orElse(null);
    }

    @Override
    public Author addAuthor(Author author) {
        author.setId(nextId++);
        authorsRepo.add(author);
        return author;
    }

    @Override
    public Author updateAuthor(int id, Author author) {
        Author existing = getAuthor(id);
        if (existing == null) return null;
        existing.setFirstName(author.getFirstName());
        existing.setLastName(author.getLastName());
        return existing;
    }

    @Override
    public boolean deleteAuthor(int id) {
        return authorsRepo.removeIf(a -> a.getId() == id);
    }
}