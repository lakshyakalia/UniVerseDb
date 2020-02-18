from flask import Flask
from flask import request
import u2py
import xmltodict
import pprint
import json
from collections import OrderedDict
from flask_cors import CORS,cross_origin
app = Flask(__name__)
CORS(app)


@app.route('/api/U2data',methods=['GET'])
def readFromU2():
	cmd=u2py.run("LIST DATA PO.ITEM.MST DESC UNIT.COST TOXML",capture=True)
	my_xml = cmd.strip()
	ids={}
	cost=[]
	itemData=[]
	dictItems={}
	dataLength=len(xmltodict.parse(my_xml)['ROOT'])
	for i in range(0,5):
		data = xmltodict.parse(my_xml)['ROOT']['PO.ITEM.MST'][i]
		ids=(data['@_ID'])
		itemData.append(data['@DESC'])
		itemData.append(data['@UNIT.COST'])
		dictItems[ids]=itemData
		itemData=[]
	return{"table": dictItems },200

if __name__ == '__main__':
	app.run()
