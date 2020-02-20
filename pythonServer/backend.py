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

def writePurchaseOrder(purchaseOrderDetails,itemOrderDetails,recordID):
    itemID = quantity = cost = bytes("","utf-8")
    orderFile = u2py.File("PO.ORDER.MST")
    orderData = u2py.DynArray()
    orderData.insert(7,0,0,purchaseOrderDetails['companyName'])
    orderData.insert(8,0,0,purchaseOrderDetails['contactName'])
    orderData.insert(9,0,0,bytes(purchaseOrderDetails['street'],"utf-8") + 
                u2py.VM + bytes(purchaseOrderDetails['city'],"utf-8") + 
                u2py.VM + bytes(purchaseOrderDetails['state'],"utf-8") + 
                u2py.VM+bytes(purchaseOrderDetails['zipCode'],"utf-8"))
    orderData.insert(10,0,0,purchaseOrderDetails['phoneNumber'])


    for item in itemOrderDetails:
        itemID = itemID + bytes(item['itemID'],"utf-8")+u2py.VM
        quantity = quantity + bytes(str(item['quantity']),"utf-8")+u2py.VM
        cost = cost + bytes(str(item['unitCost']),"utf-8")+u2py.VM
    
    orderData.insert(11,0,0,itemID)
    orderData.insert(12,0,0,quantity)
    orderData.insert(13,0,0,cost)
    print(recordID)
    orderFile.write(recordID,orderData)

@app.route('/api/order',methods=['POST'])
def saveNewOrder(): 
    data = request.get_json()
    writePurchaseOrder(data['purchaseOrderDetails'],data['itemOrderDetails']['specialRequests'],data['recordID'])
    return { 
        'status': 200,
        'msg':'data saved successfully',
        'data':data
    }

@app.route('/api/vendor',methods=['GET'])
def getAllVendors():
    vendorList = []
    data = u2py.run("LIST DATA PO.VENDOR.MST VEND.NAME TOXML",capture=True)
    
    xmldata = data.strip()
    dictdata = xmltodict.parse(xmldata)['ROOT']['PO.VENDOR.MST']
    length = len(dictdata)
    for i in range(length):
	    vendorList.append(dictdata[i]['@VEND.NAME'])

    return{
        'status':200,
        'msg':'success',
        'vendorName': vendorList
    }

@app.route('/api/vendor/items',methods=['GET'])
def getVendorItems():
    vendorItemIDList = []
    vendorName = request.args.get('vendorName')
    vendorItemData = u2py.run("LIST PO.VENDOR.MST WITH VEND.NAME = "+vendorName+ " ITEM.IDS TOXML",capture=True)

    xmldata = vendorItemData.strip()
    vendordictdata = xmltodict.parse(xmldata)['ROOT']['PO.VENDOR.MST']['ITEM.IDS_MV']
    length = len(vendordictdata)
    
    for i in range(length):
        vendorItemIDList.append(vendordictdata[i]['@ITEM.IDS'])
    return{
        'status':200,
        'msg':'success',
        'itemList': vendorItemIDList
    }

@app.route('/api/vendor/item',methods=['GET'])
def getvendorItemDetails():
    itemID = request.args.get('item')
    itemDescriptionXML = u2py.run("LIST PO.ITEM.MST WITH @ID = "+itemID+" DESC TOXML",capture=True)

    xmldata = itemDescriptionXML.strip()
    itemDescription = xmltodict.parse(xmldata)['ROOT']['PO.ITEM.MST']['@DESC']
    return {
        'status':200,
        'msg':'success',
        'data':itemDescription
    }


@app.route('/api/U2data',methods=['POST'])
def writeToU2():
	print(request.form)
	return "string",200


@app.route('/api/U2data',methods=['GET'])
def readFromU2():
	cmd=u2py.run("LIST DATA PO.ITEM.MST DESC UNIT.COST TOXML",capture=True)
	my_xml = cmd.strip()
	ids={}
	cost=[]
	itemData=[]
	dictItems={}
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
