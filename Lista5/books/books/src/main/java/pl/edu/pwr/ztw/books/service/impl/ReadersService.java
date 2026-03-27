package pl.edu.pwr.ztw.books.service.impl;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import pl.edu.pwr.ztw.books.model.Reader;
import pl.edu.pwr.ztw.books.service.IReadersService;

@Service
public class ReadersService implements IReadersService {

    private static List<Reader> readersRepo = new ArrayList<>();
    private static int nextId = 4;

    static {
        readersRepo.add(new Reader(1, "Jan", "Kowalski"));
        readersRepo.add(new Reader(2, "Anna", "Nowak"));
        readersRepo.add(new Reader(3, "Piotr", "Wiśniewski"));
    }

    @Override
    public Collection<Reader> getReaders() {
        return readersRepo;
    }

    @Override
    public Reader getReader(int id) {
        return readersRepo.stream()
                .filter(r -> r.getId() == id)
                .findAny()
                .orElse(null);
    }

    @Override
    public Reader addReader(Reader reader) {
        reader.setId(nextId++);
        readersRepo.add(reader);
        return reader;
    }

    @Override
    public Reader updateReader(int id, Reader reader) {
        Reader existing = getReader(id);
        if (existing == null) return null;
        existing.setFirstName(reader.getFirstName());
        existing.setLastName(reader.getLastName());
        return existing;
    }

    @Override
    public boolean deleteReader(int id) {
        return readersRepo.removeIf(r -> r.getId() == id);
    }
}
