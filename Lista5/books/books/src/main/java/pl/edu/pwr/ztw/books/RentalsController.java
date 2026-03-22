package pl.edu.pwr.ztw.books;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rentals")
public class RentalsController {

    @Autowired
    IRentalsService rentalsService;

    @GetMapping
    public ResponseEntity<Object> getRentals() {
        return new ResponseEntity<>(rentalsService.getRentals(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getRental(@PathVariable int id) {
        Rental rental = rentalsService.getRental(id);
        if (rental == null) return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(rental, HttpStatus.OK);
    }

    @PostMapping("/rent")
    public ResponseEntity<Object> rentBook(@RequestParam int bookId,
                                            @RequestParam String readerName) {
        Rental rental = rentalsService.rentBook(bookId, readerName);
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