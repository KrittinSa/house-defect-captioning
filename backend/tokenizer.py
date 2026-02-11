
import os
import logging
import json
import torch
from collections import Counter, OrderedDict
from pythainlp import word_tokenize
from pythainlp.util import dict_trie
from pythainlp.corpus import thai_words

logger = logging.getLogger(__name__)

class ThaiTokenizerV2:
    def __init__(self, vocab_file=None, model_max_length=128):
        self.vocab = OrderedDict()
        self.ids_to_tokens = OrderedDict()
        self.model_max_length = model_max_length
        
        # Special Tokens
        self.pad_token = "<pad>"
        self.bos_token = "<s>"
        self.eos_token = "</s>"
        self.unk_token = "<unk>"
        self.special_tokens = [self.pad_token, self.bos_token, self.eos_token, self.unk_token]
        
        # Build Custom Dictionary for PyThaiNLP to recognize special tokens
        self.custom_dict = set(thai_words())
        self.custom_dict.update(self.special_tokens)
        self.trie = dict_trie(dict_source=self.custom_dict)
        
        if vocab_file and os.path.exists(vocab_file):
            self.load_vocab(vocab_file)
        else:
            self.add_tokens(self.special_tokens)

    def add_tokens(self, tokens):
        for token in tokens:
            if token not in self.vocab:
                new_id = len(self.vocab)
                self.vocab[token] = new_id
                self.ids_to_tokens[new_id] = token

    def train_from_iterator(self, iterator):
        """Train vocab from iterator of texts."""
        logger.info("Training ThaiTokenizerV2 (pythainlp engine='newmm')...")
        counter = Counter()
        for text in iterator:
            # Tokenize using custom dictionary to preserve special tokens if any (though usually raw text doesn't have them yet)
            words = word_tokenize(text, engine="newmm", custom_dict=self.trie, keep_whitespace=False)
            counter.update(words)
        
        # Sort by frequency
        most_common = counter.most_common()
        sorted_tokens = [token for token, freq in most_common]
        
        self.add_tokens(sorted_tokens)
        logger.info(f"V2 Tokenizer built with {len(self.vocab)} words.")
        return self

    def encode(self, text):
        """Convert text to IDs"""
        # Tokenize using custom dictionary to treat <s>, </s> as single tokens
        words = word_tokenize(text, engine="newmm", custom_dict=self.trie, keep_whitespace=False)
        ids = [self.vocab.get(w, self.vocab[self.unk_token]) for w in words]
        return ids

    def decode(self, token_ids, skip_special_tokens=False):
        """Convert IDs to text"""
        if isinstance(token_ids, torch.Tensor):
            token_ids = token_ids.tolist()
            
        tokens = []
        for i in token_ids:
            token = self.ids_to_tokens.get(i, self.unk_token)
            if skip_special_tokens and token in self.special_tokens:
                continue
            tokens.append(token)
        return "".join(tokens)
    
    def batch_decode(self, sequences, skip_special_tokens=False):
        return [self.decode(ids, skip_special_tokens) for ids in sequences]

    # --- Properties for compatibility ---
    @property
    def pad_token_id(self): return self.vocab[self.pad_token]
    @property
    def bos_token_id(self): return self.vocab[self.bos_token]
    @property
    def eos_token_id(self): return self.vocab[self.eos_token]
    @property
    def unk_token_id(self): return self.vocab[self.unk_token]
    
    def __len__(self):
        return len(self.vocab)

    def save_pretrained(self, save_directory):
        """Save vocab to json"""
        os.makedirs(save_directory, exist_ok=True)
        vocab_path = os.path.join(save_directory, "vocab_v2.json")
        with open(vocab_path, 'w', encoding='utf-8') as f:
            json.dump(self.vocab, f, ensure_ascii=False, indent=2)
        logger.info(f"Saved vocab to {vocab_path}")

    def load_vocab(self, vocab_file):
        with open(vocab_file, 'r', encoding='utf-8') as f:
            self.vocab = json.load(f)
        self.ids_to_tokens = {int(v): k for k, v in self.vocab.items()} # Ensure keys are int
        # Re-build trie with new vocab if needed, but standard dictionary is usually enough + special tokens

    # --- Callable Interface for Dataset ---
    def __call__(self, text, padding="max_length", truncation=True, max_length=None, return_tensors=None):
        """
        Emulate Hugging Face tokenizer call.
        Expects single string or list of strings.
        Returns object with .input_ids
        """
        if isinstance(text, str):
            text = [text]
            
        max_len = max_length if max_length else self.model_max_length
        
        batch_input_ids = []
        
        for t in text:
            ids = self.encode(t)
            # Truncation
            if truncation and len(ids) > max_len:
                ids = ids[:max_len]
            
            # Padding
            if padding == "max_length" and len(ids) < max_len:
                ids = ids + [self.pad_token_id] * (max_len - len(ids))
            
            batch_input_ids.append(ids)
        
        # Return object with input_ids
        class BatchEncoding:
            def __init__(self, data):
                self.data = data
            @property
            def input_ids(self):
                if return_tensors == "pt":
                    return torch.tensor(self.data)
                return self.data
        
        return BatchEncoding(batch_input_ids)
