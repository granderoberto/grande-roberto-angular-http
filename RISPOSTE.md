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
