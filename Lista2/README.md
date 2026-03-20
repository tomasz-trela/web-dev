# Lista 2 - plugin WordPress

W folderze znajduje się kompletne rozwiązanie zadania w postaci pluginu WordPress:

- `random-announcements/random-announcements.php`
- `random-announcements/assets/css/random-announcements.css`

## Co robi plugin

Plugin wyświetla jedno losowe ogłoszenie na początku treści każdego posta, czyli wizualnie pomiędzy tytułem i treścią wpisu. Ogłoszenia są definiowane w panelu administratora i mogą zawierać HTML.

## Funkcje obowiązkowe

- panel administratora w `Settings -> Random Announcements`
- możliwość wpisania wielu aktualnych ogłoszeń
- losowanie jednego ogłoszenia podczas renderowania posta
- wyświetlanie ogłoszenia przed treścią wpisu

## Funkcje dodatkowe

- wykorzystanie WordPress Settings API zamiast ręcznej obsługi formularza
- shortcode `[rpa_random_announcement]`
- metabox w edycji posta do wyłączenia ogłoszenia tylko dla wybranego wpisu
- hook aktywacyjny ustawiający wartości domyślne pluginu
- możliwość włączenia ogłoszeń także na archiwach i listach wpisów
- własna klasa CSS konfigurowana z panelu

## Instalacja

1. Skopiuj folder `random-announcements` do `wp-content/plugins/`.
2. W WordPressie przejdź do `Plugins` i aktywuj `Random Announcements`.
3. Otwórz `Settings -> Random Announcements`.
4. Dodaj kilka ogłoszeń HTML i zapisz ustawienia.

## Przykładowe ogłoszenie HTML

```html
<strong>Ogłoszenie:</strong> W piątek laboratorium rozpoczyna się o 9:15. <a href="https://example.com">Szczegóły</a>
```