import requests

try:
    # We don't have a valid token, but let's test if the server handles it without crashing
    res = requests.get('http://localhost:5000/api/eselon-1/stats', headers={'Authorization': 'Bearer test'})
    print("STATUS:", res.status_code)
    print("TEXT:", res.text)
except Exception as e:
    print("ERROR:", str(e))
