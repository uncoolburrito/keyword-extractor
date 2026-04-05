from sklearn.feature_extraction.text import TfidfVectorizer
from rake_nltk import Rake
from keybert import KeyBERT
import nltk
from typing import List, Tuple
import ssl

try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

class KeywordEngine:
    def __init__(self):
        # We load nltk data specifically for Rake if not present
        try:
            nltk.data.find('corpora/stopwords')
        except LookupError:
            nltk.download('stopwords', quiet=True)
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt_tab', quiet=True)
            nltk.download('punkt', quiet=True)
            
        # Initialize models lazily or upfront. For KeyBERT, it's a bit heavy so we initialize it once.
        self._keybert_model = None

    def _get_keybert(self) -> KeyBERT:
        if self._keybert_model is None:
            self._keybert_model = KeyBERT()
        return self._keybert_model
        
    def extract(self, text: str, method: str = "semantic", top_n: int = 15) -> List[Tuple[str, float]]:
        if method == "baseline":
            return self._extract_tfidf(text, top_n)
        elif method == "advanced":
            return self._extract_rake(text, top_n)
        elif method == "semantic":
            return self._extract_keybert(text, top_n)
        else:
            # default to semantic if unknown
            return self._extract_keybert(text, top_n)

    def _extract_tfidf(self, text: str, top_n: int) -> List[Tuple[str, float]]:
        vectorizer = TfidfVectorizer(stop_words='english', max_features=1000, ngram_range=(1, 2))
        try:
            tfidf_matrix = vectorizer.fit_transform([text])
            feature_names = vectorizer.get_feature_names_out()
            scores = tfidf_matrix.toarray()[0]
            
            # Tie scores to feature names
            word_scores = [(feature_names[i], float(scores[i])) for i in range(len(feature_names))]
            # Sort by score descending
            word_scores = sorted(word_scores, key=lambda x: x[1], reverse=True)
            
            # Return top_n
            return word_scores[:top_n]
        except Exception:
            return []

    def _extract_rake(self, text: str, top_n: int) -> List[Tuple[str, float]]:
        r = Rake()
        r.extract_keywords_from_text(text)
        ranked = r.get_ranked_phrases_with_scores()
        
        # Rake returns (score, phrase), we need (phrase, score)
        # Also let's normalize score to some degree, though RAKE scores are usually > 1
        results = []
        for score, phrase in ranked[:top_n]:
            results.append((phrase, float(score)))
        return results

    def _extract_keybert(self, text: str, top_n: int) -> List[Tuple[str, float]]:
        kb = self._get_keybert()
        # use mmr to get diverse keywords
        keywords = kb.extract_keywords(
            text, 
            keyphrase_ngram_range=(1, 2), 
            stop_words='english', 
            use_mmr=True, 
            diversity=0.7,
            top_n=top_n
        )
        return [(k[0], float(k[1])) for k in keywords]
