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

def vendorDetailU2(vendorDetails,itemsId,recordID):
	vendorArray=u2py.DynArray()
	item=bytes("","utf-8")
	vendorFile=u2py.File('PO.VENDOR.MST');
	vendorArray.insert(1,0,0,vendorDetails['Company'])
	vendorArray.insert(2,0,0,vendorDetails['Contact'])
	vendorArray.insert(3,0,0,bytes(vendorDetails['Street'],"utf-8")+u2py.VM+bytes(vendorDetails['City'],"utf-8")+u2py.VM+bytes(vendorDetails['State'],"utf-8")+u2py.VM+bytes(vendorDetails['Zip'],"utf-8"))
	vendorArray.insert(4,0,0,vendorDetails['Phone'])
	for items in itemsId:
		item=item+bytes(items['items'],"utf-8")+u2py.VM
	vendorArray.insert(5,0,0,item[:-1])
	vendorFile.write(recordID,vendorArray)
@app.route('/api/itemData',methods=['GET'])
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
	cmd=u2py.run("LIST DATA PO.ITEM.MST DESC TOXML",capture=True)
	my_xml = cmd.strip()	
	ids={}
	cost=[]
	itemData=[]
	dictItems={}
	dataLength=len(xmltodict.parse(my_xml)['ROOT']['PO.ITEM.MST'])
	for i in range(dataLength):
		data = xmltodict.parse(my_xml)['ROOT']['PO.ITEM.MST'][i]
		ids=(data['@_ID'])
		itemData.append(data['@DESC'])
		dictItems[ids]=itemData
		itemData=[]
	return{"table": dictItems },200

@app.route('/api/vendorDetail',methods=['POST'])
def vendorDetails():
	print("yes")
	vendorData =request.get_json()
	itemsId=vendorData['itemId']['items'];
	vendorDetails=vendorData['vendorDetail'];
	vendorDetailU2(vendorDetails,itemsId,vendorData['recordID'])
	return{	'status':200,
		'message':"data saved",
		'data':vendorData
		}
@app.route('/api/vendorDetail',methods=['GET'])
def allVendors():
	ids={}
	cost=[]
	itemData=[]
	vendorDetail=[]
	dictItems={}
	itemId=[]
	cmd=u2py.run("LIST DATA PO.VENDOR.MST VEND.COMPANY VEND.NAME VEND.ADDRESS VEND.PHONE ITEM.IDS TOXML	",capture=True)
	my_xml=cmd.strip()
	data = xmltodict.parse(my_xml)['ROOT']['PO.VENDOR.MST']
	for i in range(len(data)):
		data = xmltodict.parse(my_xml)['ROOT']['PO.VENDOR.MST'][i]
		for j in data['ITEM.IDS_MV']:
			itemId.append(j['@ITEM.IDS'])	
			ids=data['@_ID']
		vendorDetail.append(data['@VEND.COMPANY'])
		vendorDetail.append(data['@VEND.NAME'])
		vendorDetail.append(data['@VEND.PHONE'])
		itemData.append(vendorDetail)
		itemData.append(itemId)
		dictItems[ids]=itemData
		itemData=[]
		itemId=[]
		vendorDetail=[]
	return{'status':200,
		'data':dictItems	
		}
if __name__ == '__main__':
	app.run()
