import time, requests
from pynvml import *

URL = "https://first-try-ecru.vercel.app/api/stats" # UPDATE THIS TO YOUR LIVE URL

def send_vitals():
    try:
        nvmlInit()
        h = nvmlDeviceGetHandleByIndex(0)
        temp = nvmlDeviceGetTemperature(h, NVML_TEMPERATURE_GPU)
        mem = nvmlDeviceGetMemoryInfo(h)
        data = {"temp": temp, "vram": round(mem.used / 1024**3, 1)}
        requests.post(URL, json=data, timeout=5)
        print(f"REPORTED: {temp}C | {data['vram']}GB")
    except Exception as e: print(f"FAIL: {e}")
    finally: nvmlShutdown()

while True:
    send_vitals()
    time.sleep(5)