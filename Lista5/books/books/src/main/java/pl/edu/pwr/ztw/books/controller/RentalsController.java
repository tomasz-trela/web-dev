package pl.edu.pwr.ztw.books.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import pl.edu.pwr.ztw.books.model.Rental;
import pl.edu.pwr.ztw.books.service.IRentalsService;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rentals")
public class RentalsController {

    @Autowired
    IRentalsService rentalsService;

    @GetMapping
    public ResponseEntity<Object> getRentals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Collection<Rental> all = rentalsService.getRentals();
        List<Rental> content = all.stream()
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
    public ResponseEntity<Object> getRental(@PathVariable int id) {
        Rental rental = rentalsService.getRental(id);
        if (rental == null) return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(rental, HttpStatus.OK);
    }

    @PostMapping("/rent")
    public ResponseEntity<Object> rentBook(@RequestParam int bookId,
                                            @RequestParam int readerId) {
        Rental rental = rentalsService.rentBook(bookId, readerId);
        if (rental == null) return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(rental, HttpStatus.CREATED);
    }

    @DeleteMapping("/return/{rentalId}")
    public ResponseEntity<Object> returnBook(@PathVariable int rentalId) {
        if (!rentalsService.returnBook(rentalId))
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
