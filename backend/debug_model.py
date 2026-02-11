
import os
import sys
import torch
from tokenizer import ThaiTokenizerV2
from transformers import VisionEncoderDecoderModel, ViTImageProcessor
from PIL import Image

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import config

def debug_model():
    print("--- Debugging Model Output ---")
    
    # Check Vocab
    vocab_path = os.path.join(config.MODEL_PATH, "vocab_v2.json")
    print(f"Vocab Path: {vocab_path}")
    
    if not os.path.exists(vocab_path):
        print("❌ Vocab file not found!")
        return

    tokenizer = ThaiTokenizerV2(vocab_file=vocab_path)
    print(f"Tokenizer Vocab Size: {len(tokenizer)}")
    print(f"First 10 tokens: {list(tokenizer.vocab.items())[:10]}")
    
    # Check Model
    print(f"Loading model from {config.MODEL_PATH}...")
    try:
        model = VisionEncoderDecoderModel.from_pretrained(config.MODEL_PATH)
        print("✅ Model loaded successfully")
        print(f"Model Config Vocab Size: {model.config.decoder.vocab_size}")
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        return

    # Check Processor
    try:
        processor = ViTImageProcessor.from_pretrained(config.MODEL_PATH)
        print("✅ Processor loaded successfully")
    except Exception as e:
        print(f"❌ Failed to load processor: {e}")
        return

    # Dummy Inference
    print("\n--- Running Dummy Inference ---")
    # Create a dummy image (black square)
    image = Image.new('RGB', (224, 224), color='black')
    
    pixel_values = processor(images=image, return_tensors="pt").pixel_values
    
    # Generate
    try:
        output_ids = model.generate(
            pixel_values, 
            max_length=20, 
            num_beams=4
        )
        print(f"Output IDs: {output_ids[0].tolist()}")
        
        caption = tokenizer.decode(output_ids[0], skip_special_tokens=True)
        print(f"Decoded Caption: '{caption}'")
        
    except Exception as e:
        print(f"❌ Inference failed: {e}")

if __name__ == "__main__":
    debug_model()
