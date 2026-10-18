# Aplikacja kamperowa — wymagania

Wersja 1.0, 18 października 2026. Dokument do przekazania AI budującemu aplikację. Zawiera ustalenia z rozmowy, propozycje zaakceptowane oraz kwestie otwarte. Nie dodawać nowych funkcji bez konsultacji z właścicielem.

## 1. Cel i etapy

Aplikacja webowa do planowania podróży kamperem, obsługi jego wyposażenia oraz publikowania dziennika podróży.

1. Najpierw działający, interaktywny prototyp do obejrzenia, oparty na przykładowych danych.
2. Następnie wersja z rzeczywistymi danymi i wdrożeniem na serwerze. Dostawca hostingu i technologia pozostają do wyboru.

Przykładowe dane i symulowane wyniki zewnętrznych usług należy wyraźnie oznaczyć. Prototyp nie może sugerować, że naprawdę sprawdził przejezdność drogi lub zasięg internetu.

## 2. Dostęp

- Część publiczna dostępna bez logowania.
- Część prywatna dostępna po podaniu jednego wspólnego hasła.
- Bez rejestracji i indywidualnych kont w pierwszym etapie. Konta mogą powstać później.
- Dokładny podział funkcji za hasłem, w tym ewentualne treści dla wybranych gości, pozostaje do ustalenia.
- W wersji serwerowej ochrona części prywatnej musi obejmować również dane i operacje, a nie jedynie ukrycie elementów interfejsu. Hasło nie może być zapisane jawnie w kodzie dostarczanym do przeglądarki.

## 3. Kalendarz podróży i kempingi

Użytkownik może określić w kalendarzu, kiedy i na jakim kempingu będzie przebywał. Pobyt zawiera:

- termin pobytu;
- nazwę kempingu i adres;
- koszt;
- telefon;
- stronę WWW;
- lokalizację na mapie.

Sposób rozliczania kosztu, waluty oraz zakres dat pobytu wymagają doprecyzowania w formularzu; nie zakładać bez oznaczenia, że koszt oznacza cenę za noc lub za cały pobyt.

## 4. Mapa i planowanie przejazdów

- Pokazywanie lokalizacji kempingów i trasy.
- Szacowanie czasu przejazdu uwzględniające spokojniejszą jazdę kamperem.
- Uwzględnianie gabarytów pojazdu, szczególnie wysokości i ograniczeń przejazdu.
- Preferencje dróg w zatwierdzonej kolejności: drogi ekspresowe, następnie autostrady, następnie dobre drogi lokalne odpowiednie dla kampera.
- Autostrady są dopuszczalne. Wcześniejsza sugestia ich pomijania została zastąpiona powyższą kolejnością.
- Unikanie prowadzenia przez bardzo wąskie, trudne drogi; użytkownik wskazał też problem progów zwalniających.

Do wersji produkcyjnej trzeba wybrać źródło map i tras oraz ustalić, które preferencje i ograniczenia faktycznie obsługuje. Brak danych o ograniczeniach nie oznacza potwierdzonej przejezdności. Wymiary i masa rzeczywistego pojazdu pozostają do uzupełnienia.

## 5. Przewidywany zasięg internetu

- Mapa oceny przewidywanego zasięgu przy miejscach postoju i na trasie.
- Wykorzystanie danych o BTS-ach i innych dostępnych danych o pokryciu, po ustaleniu dostawcy.
- Czytelne rozróżnienie dobrego, słabego i nieznanego zasięgu, również tekstem lub symbolem.
- Wynik ma być przedstawiony jako szacunek, nie gwarancja prędkości internetu.

Do ustalenia: operatorzy, kraje objęte działaniem oraz źródło danych. Nie zakładać, że sama odległość od nadajnika określa rzeczywistą jakość połączenia.

## 6. Wierna, klikalna wizualizacja kampera

Pojazd: **CI Mizar 140, rok 1996, na bazie Fiata Ducato**. Wcześniejsze robocze określenie „Mizar Leon” nie jest docelową nazwą.

Wizualizacja ma przedstawiać rozpoznawalny, rzeczywisty kamper użytkownika: bryłę, okna, drzwi, wyposażenie i układ wnętrza. Ma bazować na przekazanych zdjęciach, filmie i opisie właściciela, a nie na dowolnym wzorze kampera. Opis właściciela ma pierwszeństwo przed wyposażeniem innych egzemplarzy.

- Rzut z góry albo widok 3D — forma pozostaje do wyboru. Nie ustalono obowiązku realizacji obu.
- Klikanie elementów pozwala wyświetlać informacje i powiązane instrukcje.
- Szczegóły niewidoczne w materiałach należy oznaczyć jako niepotwierdzone, zamiast przedstawiać wymysł jako dokładne odwzorowanie.

### Układ potwierdzony przez właściciela

Strony lewa i prawa liczone **patrząc w kierunku jazdy**. Opis od przodu do tyłu:

1. Kabina: kierowca po lewej, pasażer po prawej. Nad kabiną wspólna alkowa z łóżkiem.
2. Za kabiną po lewej wąska leżanka.
3. Za kabiną po prawej dwie kanapy ze stołem, miejsce dla czterech osób. Pod kanapą bliżej przodu znajduje się zbiornik wody.
4. Po obu stronach części wypoczynkowej duże okna oraz szafki u góry.
5. Za leżanką po lewej wysoka szafa, pod nią ogrzewacz.
6. Dalej po prawej mała szafka oraz podnoszony blat ze schowkiem pod spodem.
7. W lewym tylnym narożniku łazienka: toaleta, umywalka, prysznic. Właściciel określił pozycję prysznica jako lewą przednią część łazienki; szczegół do sprawdzenia przy odwzorowaniu.
8. Z tyłu po prawej kuchnia: palniki, lodówka pod palnikami, zlew oraz szafki nad palnikami i zlewem. Dokładne wzajemne położenie elementów zweryfikować z materiałami.
9. Wejście do części mieszkalnej znajduje się w prawej ścianie bocznej przy kuchni, a nie w tylnej ścianie.
10. Osobne wejście/wyjście przy miejscu kierowcy.
11. Kamper ma instalację fotowoltaiczną.
12. Na zewnątrz z tyłu jest bagażnik na rowery.

### Materiały odniesienia

- Główna referencja fotograficzna: https://www.caravanmarket.com/CI-MIZAR-140-1996 — strona potwierdza oznaczenie CI Mizar 140, rok 1996 i bazę Fiat Ducato. Użytkownik wskazał ten model jako właściwy.
- Materiał dodatkowy: https://www.vantastik.it/en/van/camper-mizar-140 — strona obecnie używa nazwy „Camper Fetto”; nie stanowi samodzielnego potwierdzenia konfiguracji pojazdu użytkownika.
- Film: https://www.youtube.com/watch?v=Yj8snF-nUFw — użytkownik przekazał do odwzorowania wyglądu. Zawartości filmu nie udało się odczytać w trakcie zbierania wymagań; analiza filmu nadal jest do wykonania.

Parametry silnika, wymiary i wyposażenie sprzedawanego egzemplarza nie są automatycznie potwierdzonymi danymi kampera użytkownika.

## 7. Instrukcje obsługi

Praktyczne instrukcje krok po kroku, odpowiadające rzeczywistym urządzeniom i panelom w kamperze. Zaakceptowano zdjęcia paneli z zaznaczonymi i podpisanymi przyciskami.

Zakres:

- uruchamianie wody;
- włączanie światła w konkretnych miejscach;
- uruchamianie generatora prądu;
- obsługa, włączanie i wyłączanie instalacji fotowoltaicznej;
- obsługa akumulatora;
- uruchamianie ogrzewania;
- podgrzewanie wody;
- uruchamianie wentylatora.

Instrukcje mają być dostępne przy odpowiednich elementach klikalnej wizualizacji. Procedury należy przygotować na podstawie sprawdzonej dokumentacji i informacji właściciela. Modele urządzeń, zdjęcia paneli i konkretne procedury pozostają do zebrania. Prototyp może pokazać strukturę instrukcji, ale nie może przedstawiać wymyślonych procedur jako sprawdzonych.

## 8. Publiczny dziennik podróży

- Oś czasu / blog z wpisami dotyczącymi poszczególnych dni.
- Dodawanie zdjęć i opisów.
- Opisy odwiedzonych i zwiedzonych miejsc oraz bieżących aktywności.
- Pokazywanie przebytej trasy.
- Możliwość opisania aktualnego miejsca pobytu oraz dalszych planów.
- Podgląd wpisu przed publikacją: zdjęcia, opis i lokalizacja widoczne dla odbiorców.

Nie ustalono automatycznego śledzenia GPS ani transmisji lokalizacji na żywo. Sposób wprowadzania przebytej trasy pozostaje otwarty. Obsługa filmów w blogu nie została ustalona; na teraz potwierdzone są zdjęcia i tekst.

## 9. Ekran „Dzisiaj”

Zaakceptowana funkcja zbierająca w jednym widoku:

- cel bieżącego przejazdu;
- szacowany czas dojazdu;
- adres kolejnego kempingu;
- przycisk szybkiego połączenia telefonicznego z kempingiem.

Dane pochodzą z planu podróży.

## 10. Stan zapasów

- Ręczne zapisywanie poziomu wody, gazu i akumulatora.
- Przy każdym odczycie widoczna data jego wpisania.
- Jednostki i sposób wpisywania poziomu do ustalenia.
- Automatyczny odczyt z czujników nie został uzgodniony.

## 11. Miejsca do odwiedzenia

- Zapisywanie ciekawych miejsc na później.
- Wybieranie zapisanych miejsc podczas planowania wyjazdu i dodawanie ich do trasy.

## 12. Dostępność interfejsu

Użytkownik jest daltonistą. Statusy, trasy, oceny zasięgu i poziomy zapasów muszą być rozróżnialne bez polegania wyłącznie na kolorze: stosować etykiety, symbole lub wzory. Przyciski na zdjęciach instruktażowych oznaczać również podpisem lub numerem.

## 13. Propozycje oczekujące na potwierdzenie

Poniższe pomysły padły w rozmowie, ale nie uzyskały jednoznacznego zatwierdzenia. **Nie implementować ich jako obowiązkowego zakresu bez konsultacji.** Końcowe „dodaj to wszystko” odnosiło się bezpośrednio do ekranu „Dzisiaj”, zapasów, miejsc do odwiedzenia i podglądu publikacji.

- Checklisty przed ruszeniem kamperem.
- Wyszukiwarka przedmiotów wskazująca ich schowek na rzucie kampera.
- Dziennik serwisowy, przebieg, naprawy i rachunki.
- Prywatne oceny i notatki po pobycie na kempingu.
- Pełne zestawienie kosztów paliwa, kempingów i opłat za wyjazd.
- Mapa punktów obsługi: woda, opróżnianie zbiorników, gaz, odpowiednie parkingi.
- Dostęp offline do zapisanej trasy, adresów i instrukcji.

## 14. Decyzje otwarte przed wersją produkcyjną

- Forma wizualizacji: rzut z góry czy 3D; akceptacja jej zgodności z rzeczywistym pojazdem.
- Wymiary pojazdu oraz parametry potrzebne do wyznaczania trasy.
- Operatorzy i obszar geograficzny map zasięgu.
- Dostawcy danych mapowych, tras i zasięgu, dostępność danych oraz koszty usług.
- Dokładny podział funkcji publicznych i prywatnych.
- Sposób zapisywania przebytych tras.
- Modele urządzeń, zdjęcia paneli i treść instrukcji.
- Waluty i znaczenie kwoty kosztu pobytu.
- Jednostki poziomu zapasów.
- Technologia, hosting i trwałe przechowywanie danych oraz zdjęć.

## 15. Kryteria odbioru pierwszego prototypu

1. Można obejrzeć część publiczną oraz przejść przez demonstracyjny dostęp do części prywatnej.
2. Można dodać przykładowy pobyt do kalendarza i zobaczyć jego koszt, dane kontaktowe oraz położenie na mapie.
3. Prezentacja trasy pokazuje czas przejazdu, profil kampera i zatwierdzoną kolejność preferencji drogowych. Symulacje są podpisane.
4. Można kliknąć elementy wizualizacji zgodnej z opisanym układem i otworzyć informacje lub przykładowy widok instrukcji.
5. Instrukcja pokazuje kroki i miejsce na zdjęcie z podpisanym elementem sterującym; brakująca procedura jest oznaczona.
6. Publiczny dziennik prezentuje przykładowe wpisy, zdjęcia i trasę, a autor może zobaczyć podgląd wpisu przed publikacją.
7. Działają widoki „Dzisiaj”, ręcznych zapasów z datą oraz miejsc do odwiedzenia.
8. Mapa zasięgu rozróżnia poziomy także bez koloru i wyraźnie wskazuje dane demonstracyjne lub nieznane.
9. Dane przykładowe nie są mylone z rzeczywistymi odczytami, analizą filmu ani zweryfikowanymi warunkami drogowymi.

Prototyp służy akceptacji układu i działania. Nie oznacza jeszcze gotowości do wdrożenia na serwerze ani dostępności wszystkich integracji.
