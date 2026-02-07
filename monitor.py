import time
import requests
from pynvml import *

# CONFIGURATION
# Replace with your actual Vercel URL
VERCEL_STATS_URL = "https://first-try-ecru.vercel.app/api/stats"
UPDATE_INTERVAL = 5  # Seconds between updates

def get_gpu_stats():
    try:
        # Initialize NVIDIA Management Library
        nvmlInit()
        # Index 0 is usually your primary GPU (5070 Ti)
        handle = nvmlDeviceGetHandleByIndex(0)
        
        # Get Temperature in Celsius
        temp = nvmlDeviceGetTemperature(handle, NVML_TEMPERATURE_GPU)
        
        # Get Memory Info
        info = nvmlDeviceGetMemoryInfo(handle)
        vram_used = round(info.used / 1024**3, 1)  # Convert bytes to GB
        
        return {"temp": temp, "vram": vram_used}
    except Exception as e:
        print(f"Hardware Error: {e}")
        return None
    finally:
        try:
            nvmlShutdown()
        except:
            pass

print("--- KANYE_OS GPU MONITOR ACTIVE ---")
while True:
    stats = get_gpu_stats()
    if stats:
        try:
            # Send data to Vercel API
            response = requests.post(VERCEL_STATS_URL, json=stats, timeout=5)
            if response.status_code == 200:
                print(f"SENT: {stats['temp']}°C | {stats['vram']}GB VRAM")
            else:
                print(f"SERVER ERROR: {response.status_code}")
        except Exception as e:
            print(f"CONNECTION ERROR: {e}")
            
    time.sleep(UPDATE_INTERVAL)