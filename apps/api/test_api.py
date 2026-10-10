import urllib.request
import json

# Test API endpoint
url = "http://localhost:8000/api/loyalty/me/"

print("Testing loyalty API endpoint...")
print(f"URL: {url}")

try:
    req = urllib.request.Request(url)
    response = urllib.request.urlopen(req)
    data = json.loads(response.read())
    print(f"Status: {response.status}")
    print(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(f"Response: {e.read().decode()}")
except urllib.error.URLError as e:
    print(f"ERROR: Cannot connect to Django server")
    print(f"Reason: {e.reason}")
    print("\nMake sure Django server is running:")
    print("  cd apps/api")
    print("  ..\\..\\venv\\Scripts\\python.exe manage.py runserver 8000")
except Exception as e:
    print(f"ERROR: {e}")
