package pl.edu.pwr.ztw.books.service;

import java.util.Collection;

import pl.edu.pwr.ztw.books.model.Reader;

public interface IReadersService {
    Collection<Reader> getReaders();
    Reader getReader(int id);
    Reader addReader(Reader reader);
    Reader updateReader(int id, Reader reader);
    boolean deleteReader(int id);
}
