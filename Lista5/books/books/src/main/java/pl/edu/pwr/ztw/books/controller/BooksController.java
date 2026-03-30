package pl.edu.pwr.ztw.books.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import pl.edu.pwr.ztw.books.model.Book;
import pl.edu.pwr.ztw.books.model.BookRequest;
import pl.edu.pwr.ztw.books.service.IBooksService;
import pl.edu.pwr.ztw.books.service.IRentalsService;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/books")
public class BooksController {

    @Autowired
    IBooksService booksService;

    @Autowired
    IRentalsService rentalsService;

    @GetMapping
    public ResponseEntity<Object> getBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Collection<Book> all = booksService.getBooks();
        List<Book> content = all.stream()
                .skip((long) page * size)
                .limit(size)
                .collect(Collectors.toList());
        Map<String, Object> response = new HashMap<>();
        response.put("content", content);
        response.put("page", page);
        response.put("size", size);
        response.put("totalElements", all.size());
        response.put("totalPages", (int) Math.ceil((double) all.size() / size));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getBook(@PathVariable int id) {
        Book book = booksService.getBook(id);
        if (book == null) return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(book, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Object> addBook(@RequestBody BookRequest request) {
        Book book = booksService.addBook(request);
        if (book == null) return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        return new ResponseEntity<>(book, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateBook(@PathVariable int id,
                                              @RequestBody BookRequest request) {
        Book updated = booksService.updateBook(id, request);
        if (updated == null) return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteBook(@PathVariable int id) {
        if (booksService.getBook(id) == null)
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        rentalsService.deleteRentalsByBook(id);
        booksService.deleteBook(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
