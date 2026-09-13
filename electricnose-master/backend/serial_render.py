"""serial_reader.py — bridge between the Arduino sketch and the app."""
import time
import serial
from serial.tools import list_ports

BAUD = 9600

def list_arduino_ports():
    return [p.device for p in list_ports.comports()]

def connect(port):
    """Open port. Arduino auto-resets when the port opens; wait for READY."""
    ser = serial.Serial(port, BAUD, timeout=1.0)
    time.sleep(2.0)
    ser.reset_input_buffer()
    end = time.time() + 6
    while time.time() < end:
        if "READY" in ser.readline().decode(errors="ignore"):
            return ser
    ser.close()
    raise RuntimeError("Arduino not responding — check cable and that the sketch is uploaded.")

def _await_line(ser, prefix, timeout=20):
    end = time.time() + timeout
    while time.time() < end:
        line = ser.readline().decode(errors="ignore").strip()
        if line.startswith(prefix):
            return line
    raise TimeoutError(f"No '{prefix}' response from Arduino — reconnect and retry.")

def _bounded(v, lo=0, hi=1023):
    return max(lo, min(hi, v))

def read_baseline(ser):
    ser.write(b"B")
    p = _await_line(ser, "B").split(",")
    return {"mq135_baseline": _bounded(int(float(p[1]))),
            "mq3_baseline":   _bounded(int(float(p[2]))),
            "temp_c": float(p[3]), "rh_pct": float(p[4])}

def read_scan(ser):
    ser.write(b"S")
    p = _await_line(ser, "S").split(",")
    return {"mq135_mean": _bounded(int(float(p[1]))), "mq135_std": float(p[2]),
            "mq3_mean":   _bounded(int(float(p[3]))), "mq3_std":   float(p[4]),
            "fsr_median": _bounded(int(float(p[5]))),
            "temp_c": float(p[6]), "rh_pct": float(p[7])}

def parse_line(line):
    """For testing without hardware: parse a raw line string."""
    p = line.strip().split(",")
    if p[0] == "B" and len(p) == 5:
        return read_baseline.__wrapped__ if False else {"mq135_baseline": int(float(p[1])),
               "mq3_baseline": int(float(p[2])), "temp_c": float(p[3]), "rh_pct": float(p[4])}
    if p[0] == "S" and len(p) == 8:
        return {"mq135_mean": int(float(p[1])), "mq135_std": float(p[2]),
                "mq3_mean": int(float(p[3])), "mq3_std": float(p[4]),
                "fsr_median": int(float(p[5])), "temp_c": float(p[6]), "rh_pct": float(p[7])}
    return None