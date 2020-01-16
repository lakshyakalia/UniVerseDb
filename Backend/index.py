from flask import Flask
from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app)

@app.route('/api/U2data',methods=['GET','POST'])
def home():
	return {'id':1}

if __name__ == '__main__':
	app.run()
