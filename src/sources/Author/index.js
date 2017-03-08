import Sparql from 'virtuoso-sparql-client'
// import promisify from 'es6-promisify'

function sparqlQuery(query, endpoint, prefixes=[]){
  let client = new Sparql.Client(endpoint);
  client.setOptions('application/json');
  return client.query(query, prefixes);
}

class AuthorSource {
  static async getDetails(authorName){
    const query = `SELECT DISTINCT ?name ?abstract WHERE {
      ?person a foaf:Person .
      ?person foaf:name ?name .
      ?person dbpedia-owl:abstract ?abstract .
      FILTER(?name = "${authorName}"@fr)
      FILTER(lang(?abstract) = 'fr')
    }`;
    let exec = await sparqlQuery(query, 'http://fr.dbpedia.org/sparql');
    let details = exec.results.bindings[0];
    return details;
  }

  /**
  * Returns all document titles published by the given `authorName` ordered
  * by the year of publication. It also contains the number of citations
  * for every document.
  */
  static async allPublications(authorName){
    let query = `
    SELECT DISTINCT ?docTitle (YEAR(xsd:dateTime(?pubDate)) AS ?year) (COUNT(DISTINCT ?cits) AS ?nbCitations) ?publisher
    WHERE {
      ?p a foaf:Person .
      ?p foaf:name ?name .
      ?doc marcrel:aut ?p .
      ?doc dcterms:title ?docTitle .
      ?doc rdam:isElectronicReproduction ?printDoc .
      ?printDoc rdam:dateOfPublication ?pubDate .
      ?doc cito:isCitedBy ?cits .
      ?printDoc dcterms:publisher ?publisher
      FILTER(?name = "${authorName}")
    }
    GROUP BY ?docTitle ?name ?publisher ?pubDate
    ORDER BY ?year
    `;
    let exec = await sparqlQuery(query, 'http://data.persee.fr/sparql');
    let details = exec.results.bindings;
    return details;
  }
}
export default AuthorSource;
