package pl.edu.pwr.ztw.books.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import pl.edu.pwr.ztw.books.model.Author;
import pl.edu.pwr.ztw.books.service.IAuthorsService;
import pl.edu.pwr.ztw.books.service.IBooksService;

@RestController
@RequestMapping("/api/authors")
public class AuthorsController {

    @Autowired
    IAuthorsService authorsService;

    @Autowired
    IBooksService booksService;

    @GetMapping
    public ResponseEntity<Object> getAuthors() {
        return new ResponseEntity<>(authorsService.getAuthors(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getAuthor(@PathVariable int id) {
        Author author = authorsService.getAuthor(id);
        if (author == null) return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(author, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Object> addAuthor(@RequestBody Author author) {
        return new ResponseEntity<>(authorsService.addAuthor(author), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateAuthor(@PathVariable int id,
                                                @RequestBody Author author) {
        Author updated = authorsService.updateAuthor(id, author);
        if (updated == null) return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteAuthor(@PathVariable int id) {
        if (authorsService.getAuthor(id) == null)
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);

        booksService.deleteBooksByAuthor(id);
        authorsService.deleteAuthor(id);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
