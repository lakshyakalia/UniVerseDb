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

def checkExistingRecord(filename,recordID):
    fileObject = u2py.File(filename)
    try:
        recordObject = fileObject.read(recordID)
        return True
    except u2py.U2Error as e:
        return False

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

def writePurchaseOrder(purchaseOrderDetails,itemOrderDetails,recordID,submitStatus):
    itemID = quantity = cost = bytes("","utf-8")
    orderFile = u2py.File("PO.ORDER.MST")
    orderData = u2py.DynArray()
    orderData.insert(1,0,0,purchaseOrderDetails['orderDate'])
    orderData.insert(2,0,0,submitStatus)
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
    
    orderData.insert(11,0,0,itemID[:-1])
    orderData.insert(12,0,0,quantity[:-1])
    orderData.insert(13,0,0,cost[:-1])
    orderFile.write(recordID,orderData)
@app.route('/api/item',methods=['GET'])
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

@app.route('/api/vendor',methods=['POST'])
def vendorDetails():
	vendorData =request.get_json()
	itemsId=vendorData['itemId']['items']
	vendorDetails=vendorData['vendorDetail']
	vendorDetailU2(vendorDetails,itemsId,vendorData['recordID'])
	return{	'status':200,
		'message':"data saved",
		'data':vendorData
		}
@app.route('/api/vendor',methods=['PUT'])
def updateVendor():
	vendorData =request.get_json()
	itemsId=vendorData['itemId']['items']
	vendorDetails=vendorData['vendorDetail']
	vendorDetailU2(vendorDetails,itemsId,vendorData['recordID'])
	return{	'status':200,
		'message':"data saved",
		'data':vendorData
		}
@app.route('/api/vendor',methods=['GET'])
def allVendors():
	ids={}
	cost=[]
	itemData=[]
	vendorDetail=[]
	dictItems={}
	itemId=[]
	cmd=u2py.run("LIST DATA PO.VENDOR.MST VEND.COMPANY VEND.NAME VEND.ADDRESS VEND.PHONE ITEM.IDS TOXML",capture=True)
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
	return{
		'status':200,
		'data':dictItems	
	}

#-----------Purchase Order Routes-----------------
@app.route('/api/order',methods=['POST'])
def saveNewOrder(): 
    data = request.get_json()
    writePurchaseOrder(data['purchaseOrderDetails'],data['itemOrderDetails']['specialRequests'],data['recordID'],data['submitStatus'])
    return { 
        'status': 200,
        'msg':'data saved successfully',
        'data':data
    }

@app.route('/api/order',methods=['GET'])
def getAllOrders():
    itemList = []
    itemOrderDataXML = u2py.run("LIST DATA PO.ORDER.MST ORDER.DATE COMP.NAME TOXML",capture=True)
    xmldata = itemOrderDataXML.strip()
    itemOrderDict = xmltodict.parse(xmldata)['ROOT']['PO.ORDER.MST']
    for i in itemOrderDict:
        tempDict = {}
        tempDict['purchaseOrderNo'] = i['@_ID']
        tempDict['orderDate'] = i['@ORDER.DATE']
        tempDict['companyName'] = i['@COMP.NAME']
        itemList.append(tempDict)

    return {
        'status': 200,
        'msg':'success',
        'list': itemList
    }

@app.route('/api/order/<orderID>',methods=['GET'])
def particularOrderDetails(orderID):
    status = checkExistingRecord('PO.ORDER.MST',orderID)
    if(status):
        orderDetailsXML = u2py.run("LIST DATA PO.ORDER.MST "+orderID+" ORDER.DATE COMP.NAME COMP.CONTACT.NAME COMP.ADDRESS COMP.PHONE ORDER.ITEM.IDS ORDER.ITEM.QTY ORDER.ITEM.COST TOXML",capture=True)
        xmldata = orderDetailsXML.strip()
        orderDetail = xmltodict.parse(xmldata)['ROOT']['PO.ORDER.MST']
        orderDetailsDict = itemDict = {}
        
        itemList = []
        orderDetailsDict['orderDate'] = orderDetail['@ORDER.DATE']
        orderDetailsDict['companyName'] = orderDetail['@COMP.NAME']
        orderDetailsDict['phoneNumber'] = orderDetail['@COMP.PHONE']
        orderDetailsDict['contactName'] = orderDetail['@COMP.CONTACT.NAME']

        orderDetailsDict['street'] = orderDetail['COMP.ADDRESS_MV'][0]['@COMP.ADDRESS']
        orderDetailsDict['city'] = orderDetail['COMP.ADDRESS_MV'][1]['@COMP.ADDRESS']
        orderDetailsDict['state'] = orderDetail['COMP.ADDRESS_MV'][2]['@COMP.ADDRESS']
        orderDetailsDict['zipCode'] = orderDetail['COMP.ADDRESS_MV'][3]['@COMP.ADDRESS']
        
        for i in range(len(orderDetail['ORDER.ITEM.IDS_MV'])):
            itemDict = {}
            itemDict['itemID'] = orderDetail['ORDER.ITEM.IDS_MV'][i]['@ORDER.ITEM.IDS']
            itemDict['cost'] = orderDetail['ORDER.ITEM.COST_MV'][i]['@ORDER.ITEM.COST']
            itemDict['quantity'] = orderDetail['ORDER.ITEM.QTY_MV'][i]['@ORDER.ITEM.QTY']
            itemList.append(itemDict)
        return {
            'status': 200,
            'data': orderDetailsDict,
            'itemList': itemList
        }
    else:
        return{
            'status':404,
            'msg': 'Order no not found'
        }

@app.route('/api/item',methods=['GET'])
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
#-----------Purchase Order Routes-----------------


if __name__ == '__main__':
	app.run()
