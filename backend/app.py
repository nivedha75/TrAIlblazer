from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def hello():
    return "Hello from Flask"

@app.route('/api/hello')
def api_hello():
    return jsonify({'message': 'Flask and React are connected!'})

if __name__ == '__main__':
    app.run(debug=True)