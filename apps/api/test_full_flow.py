import os
import django
os.environ['DJANGO_SETTINGS_MODULE'] = 'api.settings.local'
django.setup()

from django.test import Client
import json

client = Client()

print("Step 1: Request OTP...")
response = client.post('/api/auth/request-otp/', {
    'phone': '+79991234567',
    'device_info': 'test'
}, content_type='application/json')

print(f"Response status: {response.status_code}")
print(f"Response data: {json.loads(response.content)}")

print("\nStep 2: Verify OTP...")
response = client.post('/api/auth/verify-otp/', {
    'phone': '+79991234567',
    'otp_code': '000000',
    'device_info': 'test'
}, content_type='application/json')

print(f"Response status: {response.status_code}")
if response.status_code == 200:
    data = json.loads(response.content)
    print(f"Access token: {data.get('access_token', 'N/A')[:50]}...")
    print(f"User: {data.get('user', {}).get('name', 'N/A')}")
else:
    print(f"Error: {json.loads(response.content)}")
