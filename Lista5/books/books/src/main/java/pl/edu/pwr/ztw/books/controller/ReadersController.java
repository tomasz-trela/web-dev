package pl.edu.pwr.ztw.books.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import pl.edu.pwr.ztw.books.model.Reader;
import pl.edu.pwr.ztw.books.service.IReadersService;
import pl.edu.pwr.ztw.books.service.IRentalsService;

@RestController
@RequestMapping("/api/readers")
public class ReadersController {

    @Autowired
    IReadersService readersService;

    @Autowired
    IRentalsService rentalsService;

    @GetMapping
    public ResponseEntity<Object> getReaders() {
        return new ResponseEntity<>(readersService.getReaders(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getReader(@PathVariable int id) {
        Reader reader = readersService.getReader(id);
        if (reader == null) return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(reader, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Object> addReader(@RequestBody Reader reader) {
        return new ResponseEntity<>(readersService.addReader(reader), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateReader(@PathVariable int id, @RequestBody Reader reader) {
        Reader updated = readersService.updateReader(id, reader);
        if (updated == null) return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteReader(@PathVariable int id) {
        if (readersService.getReader(id) == null)
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        rentalsService.deleteRentalsByReader(id);
        readersService.deleteReader(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
