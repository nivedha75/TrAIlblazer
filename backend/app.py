from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def hello():
    return "Hello from Flask"

@app.route('/api/hello')
def api_hello():
    return jsonify({'message': 'Flask and React are connected!'})

if __name__ == '__main__':
    app.run(debug=True)