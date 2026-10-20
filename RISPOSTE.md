# Risposte

## Passo 6: richieste osservate

Strumenti per sviluppatori, scheda Network, filtro Fetch/XHR.

| Pulsante | Metodo | URL | Stato |
|---|---|---|---|
| Carica un post (con 1) | GET | `https://jsonplaceholder.typicode.com/posts/1` | 200 |
| Carica un post (con 999) | GET | `https://jsonplaceholder.typicode.com/posts/999` | 404 |
| Carica tutti | GET | `https://jsonplaceholder.typicode.com/posts` | 200 |
| Invia un post | POST | `https://jsonplaceholder.typicode.com/posts` | 201 |

Note:

- Con 999 nella pagina compare l'avviso rosso "Errore 404: Http failure response for https://jsonplaceholder.typicode.com/posts/999: 404".
- Nella riga della POST, in Payload c'è l'oggetto che ho mandato (`userId`, `title`, `body`), in Response lo stesso oggetto con `"id": 101`.
- Prima della POST c'è anche una richiesta OPTIONS con stato 204: è il browser che chiede il permesso CORS. Nella risposta c'è `access-control-allow-origin: http://localhost:4200` e tra i metodi permessi c'è POST.
- Senza rete, Carica tutti dà "Errore 0: Http failure response for https://jsonplaceholder.typicode.com/posts: 0 undefined". Stato 0 vuol dire che la richiesta non è proprio arrivata al server.

## 1. A che cosa serve provideHttpClient() e in quale file va scritto?

Serve a configurare `HttpClient`, il servizio di Angular che fa le richieste HTTP. Va scritto in `src/app/app.config.ts`, nell'array `providers`, insieme a `provideRouter(routes)`.

Nelle versioni recenti `HttpClient` funziona anche senza, ma quella riga resta il posto dove si configura l'HTTP di tutta l'app (per esempio più avanti per aggiungere il token a ogni richiesta). Nelle versioni meno recenti, se mancava, compariva `NullInjectorError: No provider for HttpClient!`.

## 2. constructor(public http: HttpClient) e private readonly http = inject(HttpClient): che differenza c'è? Quale non funziona dentro @Service()?

Fanno la stessa cosa: chiedono ad Angular l'istanza di `HttpClient`. Con il costruttore Angular la passa come parametro e `public` la trasforma in una proprietà. Con `inject()` la chiedo direttamente nella dichiarazione della proprietà, senza costruttore.

`inject()` è più corto e con `private readonly` nessuno da fuori può usare o sostituire `http`. Dentro una classe `@Service()` funziona solo `inject()`. Ho provato a scrivere un servizio con `constructor(public http: HttpClient)` e la compilazione si ferma con `NG2028: @Service class cannot use constructor dependency injection. Use the inject function instead.` Per questo tutti i servizi del progetto (`PostService`, `CatService`, `NasaService`, `PokemonService`) usano `inject(HttpClient)`.

## 3. Che cos'è un Observable? Quando parte la richiesta scritta in getPosts()?

Un Observable è la promessa di un valore che arriverà più avanti. La risposta del server non arriva subito, quindi `http.get` non può restituire i dati: restituisce un Observable a cui ci si iscrive.

La richiesta di `getPosts()` parte solo quando il componente chiama `subscribe`, cioè quando premo **Carica tutti** e viene eseguito `caricaTutti()`. Se chiamassi `getPosts()` senza `subscribe` nella scheda Network non comparirebbe niente. Se chiamassi `subscribe` due volte partirebbero due richieste.

## 4. Che cosa fanno next ed error in subscribe({ next, error })? Quale dei due viene chiamato con il post 999, e con quale codice di stato?

`next` viene chiamata quando arriva la risposta, con i dati già trasformati in oggetto (per esempio un `Post`). `error` viene chiamata al posto di `next` quando la richiesta fallisce: codice 4xx o 5xx, rete assente, richiesta bloccata.

Con il post 999 viene chiamato `error`, perché il server risponde **404 Not Found**. In pagina compare "Errore 404: Http failure response for https://jsonplaceholder.typicode.com/posts/999: 404".

## 5. Perché post, posts, loading ed errore sono signal? Che cosa succederebbe con delle proprietà semplici?

Perché cambiano dentro `next` o `error`, cioè quando arriva la risposta, molto dopo il click e fuori da qualsiasi evento del template. Angular è zoneless e nessuno lo avvisa che una proprietà è cambiata. Con `this.posts.set(dati)` il signal avvisa Angular, che aggiorna la parte di template che lo legge.

Con delle proprietà semplici, per esempio `posts: Post[] = []` e poi `this.posts = dati`, il valore nella classe cambierebbe ma la pagina resterebbe vuota. Nella scheda Network vedrei la risposta arrivare, ma sullo schermo non succederebbe niente. Lo stesso per lo spinner, che resterebbe sempre acceso o non comparirebbe mai.

## 6. Perché conviene tipizzare le risposte con un'interfaccia (Post, CatFact) invece di usare any? Un esempio di errore che l'interfaccia fa scoprire subito.

Con `http.get<Post[]>` TypeScript sa che la risposta è una lista di `Post`. L'editor mi suggerisce i campi (`id`, `title`, `body`, `userId`) e la compilazione si ferma se uso un nome sbagliato. Con `any` l'errore si vedrebbe solo nel browser, come un campo vuoto o `undefined`.

Esempio: se nel template dei post scrivo `{{ p.titolo }}` invece di `{{ p.title }}`, la compilazione si ferma con `TS2339: Property 'titolo' does not exist on type 'Post'`. Nella pagina dei gatti, se scrivo `f.text` invece di `f.fact`, succede la stessa cosa con `CatFact`.

Attenzione però: TypeScript si fida di me e non controlla il JSON vero. Per questo le interfacce le ho scritte guardando le risposte nel browser.

## 7. Che cosa fa il pipe json e perché è utile durante lo sviluppo?

Trasforma un oggetto in testo JSON indentato. Con `{{ p | json }}` dentro un `<pre>` vedo esattamente che cosa ha risposto il server, campo per campo, senza aprire gli strumenti per sviluppatori.

È utile per controllare che l'interfaccia corrisponda alla risposta vera e per vedere al volo che cosa è tornato da una POST (per esempio l'`id: 101`). Va importato `JsonPipe` da `@angular/common` negli `imports` del componente, altrimenti esce `NG8004: No pipe found with name 'json'`.

## 8. Perché la POST restituisce sempre l'id 101? Perché nella POST non si usa JSON.stringify?

JSONPlaceholder è un'API finta: ha 100 post e risponde come un server vero, assegnando al nuovo post l'id successivo, cioè 101. Però non salva niente. Quindi se premo di nuovo **Invia un post** l'id è ancora 101, e se ricarico l'elenco i post sono sempre 100.

`JSON.stringify` non si usa perché `http.post` riceve l'oggetto così com'è e lo trasforma in JSON da solo, aggiungendo l'header `Content-Type: application/json`. Se gli passassi una stringa la invierebbe come testo semplice, e molti server non la capirebbero.

## 9. Descrivi i passi con cui hai tenuto la chiave della NASA fuori dal repository. A che cosa serve environment.example.ts?

1. Ho generato i file di ambiente con `ng g environments`. Ha creato `environment.ts` ed `environment.development.ts` e ha aggiornato `angular.json`. Poi ho fermato e riavviato `ng serve`.
2. Prima di fare qualsiasi commit ho aggiunto in fondo al `.gitignore` del progetto le righe `/src/environments/environment.ts` e `/src/environments/environment.development.ts`.
3. Ho creato `environment.example.ts` con `nasaApiKey: 'INSERISCI_QUI_LA_TUA_CHIAVE'`.
4. Ho scritto la chiave vera negli altri due file.
5. Con `git status` ho controllato che comparissero solo `.gitignore`, `angular.json` ed `environment.example.ts`, e poi ho fatto il commit.

`environment.example.ts` è l'unico dei tre che va nel repository. Serve a chi clona il progetto (anche al docente): lo copia due volte con i nomi `environment.ts` ed `environment.development.ts` e ci mette la sua chiave. Senza questi file la compilazione si ferma con `TS2307: Cannot find module '../../environments/environment'`.

Una cosa che ho scoperto: se `ng serve` era già acceso prima di `ng g environments`, continua a usare `environment.ts` al posto di quello `.development`, finché non lo riavvii.

## 10. Perché la chiave in un'app Angular non è comunque segreta? Dove andrebbe tenuta una chiave davvero importante?

Perché il `.gitignore` la tiene fuori solo da GitHub. Quando avvio l'app, tutto il codice, file di ambiente compresi, viene scaricato ed eseguito dal browser. Chiunque può vedere la chiave negli strumenti per sviluppatori: nella scheda Network è proprio nell'URL, `?api_key=...`.

Per una chiave gratuita di esercitazione va bene. Una chiave importante deve stare su un **server**: il browser chiede i dati al mio server, e il server fa la richiesta alla NASA con la chiave, senza mai mandarla al browser. Questo lo faremo nel modulo full stack.

## Prove in autonomia

- **Livello 1, post a pagine:** in `PostService` c'è `getPagina(pagina)` con `params: { _page: pagina, _limit: 10 }`. Il pulsante **Carica a pagine** carica la pagina 1, poi **Precedente** e **Successiva** cambiano pagina. Nella scheda Network gli URL sono `.../posts?_page=1&_limit=10`, `.../posts?_page=2&_limit=10` e così via. Alla pagina 10 (post dal 91 al 100) **Successiva** è disabilitato, alla pagina 1 lo è **Precedente**.
- **Livello 2, Pokédex:** all'apertura la pagina mostra i tipi come badge, presi da `https://pokeapi.co/api/v2/type`. La ricerca accetta nome o numero (`pikachu` o `25`), toglie gli spazi e mette tutto minuscolo. Mostra immagine, altezza (4 diventa 0.4 m) e peso (60 diventa 6 kg). Con un nome sbagliato il server risponde 404 e compare "Pokémon non trovato". L'API restituisce i tipi a gruppi di 20 (`count` è 21), quindi uno non compare.
- **Livello 3, foto di un altro giorno:** in `NasaService` c'è `getApodDel(data)` che aggiunge il parametro `date`. Con una data futura il server risponde **400 Bad Request** con `{"code":400,"msg":"Date must be between Jun 16, 1995 and Oct 20, 2026."}`. In pagina mostro "Data non valida:" seguito dal messaggio del server. Provando più volte con `DEMO_KEY` ho anche preso il 429, cioè il limite di richieste superato. Con la mia chiave personale, scegliendo il 14 ottobre 2026 la richiesta diventa `.../apod?api_key=...&date=2026-10-14` e il server risponde 200 con la data giusta. Però al posto della foto compare il logo della NASA e il titolo è "NASA Science". Ho controllato la risposta nella scheda Network: è proprio quella che manda il server, per qualsiasi data (anche il 2020). Il sito di APOD è stato spostato su science.nasa.gov e l'API ora restituisce il logo e il titolo della pagina nuova invece della foto. Quindi il problema è del server, non dell'app: il template mostra quello che arriva in `url` e `title`. Ogni tanto il server risponde anche 500, ma riprovando funziona.
