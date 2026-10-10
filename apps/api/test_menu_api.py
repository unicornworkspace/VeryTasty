import os
import django
os.environ['DJANGO_SETTINGS_MODULE'] = 'api.settings.local'
django.setup()

from django.test import Client
import json

client = Client()

print("Testing /api/menu/categories/...")
response = client.get('/api/menu/categories/')
print(f"Status: {response.status_code}")
if response.status_code == 200:
    data = json.loads(response.content)
    print(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")

print("\nTesting /api/menu/items/...")
response = client.get('/api/menu/items/')
print(f"Status: {response.status_code}")
if response.status_code == 200:
    data = json.loads(response.content)
    print(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
