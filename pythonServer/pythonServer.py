from flask import Flask, request,jsonify, render_template
from flask_cors import CORS, cross_origin
import pandas as pd
import u2py
import os

app = Flask(__name__)
CORS(app)

theArray = u2py.DynArray()

@app.route('/api/U2data',methods=['POST'])
def savedata():
	json_data = request.json
	rec = json_data['recordname']
	val = 0
	data = pd.read_excel(open(excel_file,'rb'),sheet_name='Sheet1')
	for i,j in data.iterrows():
		theArray.insert(val,0,0,j['empname'])
		val+=1
	f.write('name',theArray)
	return {'id':1}

@app.route('/api/U2data',methods=['GET'])
def readFromU2():
	data=[]
	f=u2py.File("STUDENTDATA")
	theArray=f.read("name")
	data=f.read("name")
	data=tuple(data)
	return{"data":data},201


@app.route('/fileupload',methods=['POST'])
def savefiledata():
	if request.method == 'POST':
		f = request.files['file']
		filePath = os.path.join(os.path.dirname(os.path.abspath(__file__)),f.filename)
		print(filePath)
		return '0',204

if __name__ == '__main__':
	app.run()

