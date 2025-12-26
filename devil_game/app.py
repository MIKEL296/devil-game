from flask import Flask, jsonify, request, send_from_directory
import os, json

app = Flask(__name__, static_folder='.')
HIGHSCORE_FILE = 'highscores.json'

def read_highscores():
    if not os.path.exists(HIGHSCORE_FILE):
        return []
    try:
        return json.load(open(HIGHSCORE_FILE,'r',encoding='utf-8'))
    except Exception:
        return []

def write_highscores(data):
    json.dump(data, open(HIGHSCORE_FILE,'w',encoding='utf-8'), indent=2)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    if os.path.exists(path):
        return send_from_directory('.', path)
    return ('Not Found',404)

@app.route('/api/highscores', methods=['GET'])
def get_highscores():
    data = read_highscores()
    # sort desc
    data = sorted(data, key=lambda x: x.get('score',0), reverse=True)
    return jsonify(data)

@app.route('/api/highscores', methods=['POST'])
def post_highscore():
    payload = request.get_json() or {}
    name = payload.get('name','Player')[:32]
    score = int(payload.get('score',0))
    data = read_highscores()
    data.append({'name':name,'score':score})
    data = sorted(data, key=lambda x: x.get('score',0), reverse=True)[:100]
    write_highscores(data)
    return jsonify({'ok':True})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
