from flask import Flask
import u2py
from flask_cors import CORS,cross_origin
app = Flask(__name__)
CORS(app)
@app.route('/')
def mainPage():
	return "Hello"
@app.route('/api/U2data',methods=['GET'])
def readFromU2():
	username = request.args.get('data')
	print(username)
	filename=''
	record=''
	data=[]
	f=u2py.File("UBER")
	theArray=u2py.DynArray()
	theArray=f.read("NAME")
	data=f.read("NAME")
	data=tuple(data)
	print(theArray)
	return{"data":data},201
if __name__ == '__main__':
	app.run()
