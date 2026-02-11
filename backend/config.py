import os

# Base Paths
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))

# --- Path Configuration ---
MODEL_PATH = os.path.join(BACKEND_DIR, "models")

# Font Configuration
# Font Configuration
FONT_URL = "https://github.com/googlefonts/sarabun/raw/main/fonts/ttf/Sarabun-Regular.ttf"
FONT_PATH = os.path.join(BACKEND_DIR, "Sarabun-Regular.ttf")

# --- Device Configuration ---
def get_device():
    try:
        import torch
        if torch.cuda.is_available():
            return "cuda"
        elif torch.backends.mps.is_available():
            return "mps"
        else:
            return "cpu"
    except ImportError:
        return "cpu"

DEVICE = get_device()

# --- Model Settings ---
MAX_LENGTH = 50
NUM_BEAMS = 4
REPETITION_PENALTY = 1.2
