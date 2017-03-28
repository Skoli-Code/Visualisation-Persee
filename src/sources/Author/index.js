import Sparql from 'virtuoso-sparql-client'
// import promisify from 'es6-promisify'

async function sparqlQuery(query, endpoint, singleResult=false){
  let client = new Sparql.Client(endpoint);
  client.setOptions('application/json');
  let exec = await client.query(query);
  let results = exec.results.bindings;
  return singleResult ? results[0] : results;
}
const ENDPOINTS = {
  DBPEDIA: 'http://fr.dbpedia.org/sparql',
  PERSEE: 'http://data.persee.fr/sparql',
  BNF: 'http://data.bnf.fr/sparql'
};

class AuthorSource {
  static async set(storageKey, query, endpoint, singleResult=false){
    let result = await sparqlQuery(query, endpoint);
    localStorage.setItem(storageKey, JSON.stringify(result));
    return result;
  }

  static get(storageKey, query, endpoint, useSingleResult=false){
    const storageItem = localStorage.getItem(storageKey);
    if(!storageItem){
      return AuthorSource.set(storageKey, query, endpoint, useSingleResult);
    }
    return JSON.parse(storageItem);
  }

  static async getDetails(authorName){
    const query = `SELECT DISTINCT ?name ?abstract WHERE {
      ?person a foaf:Person .
      ?person foaf:name ?name .
      ?person dbpedia-owl:abstract ?abstract .
      FILTER(?name = "${authorName}"@fr)
      FILTER(lang(?abstract) = 'fr')
    }`;
    return sparqlQuery(query, ENDPOINTS.DBPEDIA, true);
  }

  /**
  * Returns all document titles published by the given `authorName` ordered
  * by the year of publication. It also contains the number of citations
  * for every document.
  */
  static async allPublications(authorName){
    const query = `
    SELECT ?docURL ?docTitle ?docAbstract ?englishDocAbstract (YEAR(?date) as ?year) (COUNT(DISTINCT ?docCitations) AS ?nbCitations) ?journal
    WHERE {
      ?p a foaf:Person .
      ?p foaf:name "${authorName}" .
      ?j a bibo:Journal .
      ?doc a bibo:Document .
      ?i dcterms:isPartOf ?j .
      ?doc dcterms:isPartOf ?i .
      ?doc marcrel:aut ?p .
      ?doc dcterms:title ?docTitle .
      ?j dcterms:title ?journal .
      ?doc persee:dateOfPrintPublication ?date .
      ?doc dcterms:identifier ?docURL .
      OPTIONAL {
        ?doc cito:isCitedBy ?docCitations .
      }
    }
    GROUP BY ?docURL ?date ?journal ?docTitle ?docAbstract ?englishDocAbstract
    ORDER BY ?year`;
    return sparqlQuery(query, ENDPOINTS.PERSEE);
  }

  static async compareAuthors(authorNames){
    const query=`
    SELECT (YEAR(?date) as ?year) ?authorName (COUNT(?doc) as ?nbDocs) (COUNT(?citations) as ?nbCitations)
    WHERE {
      ?doc a bibo:Document .
      OPTIONAL {
        ?doc cito:isCitedBy ?citations
      }
      FILTER(?authorName IN (${authorNames.join(', ')}))
    }
    GROUP BY ?authorName ?date
    ORDER BY ?year`;
    return sparqlQuery(query, ENDPOINTS.PERSEE);
  }
}
export default AuthorSource;
