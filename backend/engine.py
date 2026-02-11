import os
import torch
from PIL import Image
from transformers import VisionEncoderDecoderModel, ViTImageProcessor
from tokenizer import ThaiTokenizerV2
import config

class ImageCaptioningEngine:
    def __init__(self, model_path=None, **kwargs):
        self.device = config.DEVICE
        self.model_path = model_path if model_path else config.MODEL_PATH
        self.model = None
        self.tokenizer = None
        self.processor = None
        self.model_kwargs = kwargs
        
        self._load_model()

    def _load_model(self):
        print(f"⏳ Loading model from {self.model_path}...")
        try:
            self.model = VisionEncoderDecoderModel.from_pretrained(
                self.model_path,
                **self.model_kwargs
            )
            
            vocab_path = os.path.join(self.model_path, "vocab_v2.json")
            self.tokenizer = ThaiTokenizerV2(vocab_file=vocab_path)
            
            self.processor = ViTImageProcessor.from_pretrained(self.model_path)
            
            self.model.to(self.device)
            print(f"✅ Model loaded on {self.device}!")
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            raise e

    def predict(self, image_source, max_length=50, num_beams=4):
        """
        Predict caption for a single image.
        Args:
            image_source: Path to image or PIL Image object
        Returns:
            str: Generated caption
        """
        if isinstance(image_source, str):
            image = Image.open(image_source).convert("RGB")
        else:
            image = image_source.convert("RGB")

        pixel_values = self.processor(images=image, return_tensors="pt").pixel_values.to(self.device)
        
        with torch.no_grad():
            output_ids = self.model.generate(
                pixel_values, 
                max_length=max_length, 
                num_beams=num_beams, 
                repetition_penalty=2.0
            )
        
        caption = self.tokenizer.decode(output_ids[0], skip_special_tokens=True)
        return caption
