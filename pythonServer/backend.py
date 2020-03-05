from flask import Flask
from flask import request
from flask import jsonify
from flask import make_response
from functools import wraps
import u2py
import xmltodict
import pprint
import json
import random
import jwt
import datetime
from collections import OrderedDict
from flask_cors import CORS,cross_origin
app = Flask(__name__)
app.config['SECRET_KEY']='thisisthesercretkey'
CORS(app)

##################JWT is working 
def checkuser(username,password):
	users={"user1":"abc","user2":"xyz","user3":"123"}
	for keys in users.keys():
		if(keys==username):
			if(users[username]==password):
				return 'True'
			else:
				return 'False'
		else:
			return 'False'

def token_required(f):
    @wraps(f)
    def decorated(*args,**kwargs):
        token=request.headers.get('Authorization')
        print(token)
        if not token:
            print("")
            return{"msg":"Token is missing"
                },403
        try:
            data=jwt.decode(token,app.config['SECRET_KEY'])
            return data
        except:
            return{'msg':'Token is invalid'},403
    return decorated


@app.route('/login',methods=['POST'])
def login():
	auth=request.get_json()
	print(auth['loginDetails'])
	username=auth['loginDetails']['username']
	password=auth['loginDetails']['password']
	if(checkuser(username,password)):
		token=jwt.encode({'username':username,'exp':datetime.datetime.utcnow()+datetime.timedelta(minutes=30)},app.config['SECRET_KEY'])
		return {'token': token.decode('UTF-8'),"status":200}
	return make_response('Could not verify!',401)

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
	vendorFile=u2py.File('PO.VENDOR.MST')
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
                u2py.VM+bytes(str(purchaseOrderDetails['zipCode']),"utf-8"))
    orderData.insert(10,0,0,str(purchaseOrderDetails['phoneNumber']))

    for item in itemOrderDetails:
        itemID = itemID + bytes(item['itemID'],"utf-8")+u2py.VM
        quantity = quantity + bytes(str(item['quantity']),"utf-8")+u2py.VM
        cost = cost + bytes(str(item['unitCost']),"utf-8")+u2py.VM
    
    orderData.insert(11,0,0,itemID[:-1])
    orderData.insert(12,0,0,quantity[:-1])
    orderData.insert(13,0,0,cost[:-1])
    orderData.insert(14,0,0,purchaseOrderDetails['vendorName'])
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
	vendorId = random.randrange(12,10**6)
	itemsId=vendorData['itemId']['items']
	vendorDetails=vendorData['vendorDetail']
	vendorDetailU2(vendorDetails,itemsId,vendorId)
	return{	'status':200,
		'msg':"vendor created",
		'data':vendorData
		}
@app.route('/api/vendor/<vendorId>',methods=['PUT'])
def updateVendor(vendorId):
	vendorData =request.get_json()
	itemsId=vendorData['itemId']['items']
	vendorDetails=vendorData['vendorDetail']
	vendorDetailU2(vendorDetails,itemsId,vendorId)
	return{	'status':200,
		'msg':"vendor updated",
		'data':vendorData
		}
@app.route('/api/vendor',methods=['GET'])
####@token_required this decorater is not working 
def allVendors():
    print('--------')
    ids={}
    cost=[]
    itemData=[]
    vendorDetail=[]
    dictItems={}
    itemId=[]
    cmd=u2py.run("LIST DATA PO.VENDOR.MST VEND.COMPANY VEND.NAME VEND.ADDRESS VEND.PHONE ITEM.IDS TOXML",capture=True)
    my_xml=cmd.strip()
    data = xmltodict.parse(my_xml)['ROOT']['PO.VENDOR.MST']
    data1=data
    if(type(data) is list):
        for i in range(len(data)):
            data = data1[i]		
            for j in data['ITEM.IDS_MV']:
                if(type(data['ITEM.IDS_MV']) is list):
                    itemId.append(j['@ITEM.IDS'])		
                    ids=data['@_ID']
                else:
                    itemId.append(data['ITEM.IDS_MV']['@ITEM.IDS'])
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
    else:		
        itemId.append(data['ITEM.IDS_MV']['@ITEM.IDS'])
        ids=data['@_ID']
        vendorDetail.append(data['@VEND.COMPANY'])
        vendorDetail.append(data['@VEND.NAME'])
        vendorDetail.append(data['@VEND.PHONE'])
        itemData.append(vendorDetail)
        itemData.append(itemId)
        dictItems[ids]=itemData
    return{'status':200,
		'data':dictItems	
		}
@app.route('/api/vendor/<vendorId>',methods=['GET'])
def particularVendor(vendorId):
	status = checkExistingRecord("PO.VENDOR.MST",vendorId)
	if(status):
		dictItems={}
		itemId=[]
		itemDict={}
		vendorDict={}
		cmd=u2py.run("LIST DATA PO.VENDOR.MST "+vendorId+" VEND.COMPANY VEND.NAME VEND.ADDRESS VEND.PHONE ITEM.IDS TOXML",capture=True)
		my_xml=cmd.strip()
		data = xmltodict.parse(my_xml)['ROOT']['PO.VENDOR.MST']
		if(type(data['ITEM.IDS_MV']) is list):
			for j in range (len(data['ITEM.IDS_MV'])):
				itemDict={}
				itemDict['itemId']= data['ITEM.IDS_MV'][j]['@ITEM.IDS']
				itemId.append(itemDict)
		else:
			itemDict['itemId']= data['ITEM.IDS_MV']['@ITEM.IDS']
			itemId.append(itemDict)
		vendorDict['Company']=data['@VEND.COMPANY']
		vendorDict['Contact']=data['@VEND.NAME']
		vendorDict['Phone']=data['@VEND.PHONE']
		vendorDict['Street']=data['VEND.ADDRESS_MV'][0]['@VEND.ADDRESS']
		vendorDict['City']=data['VEND.ADDRESS_MV'][1]['@VEND.ADDRESS']
		vendorDict['State']=data['VEND.ADDRESS_MV'][2]['@VEND.ADDRESS']
		vendorDict['Zip']=data['VEND.ADDRESS_MV'][3]['@VEND.ADDRESS']
		vendorData = {}		
		vendorData['particularVendorData'] = vendorDict
		vendorData['itemIds'] = itemId
		
		return{'status':200,
			'vendorData':vendorData		
			}
	else:
		return {
			'status':404,
			'msg':'Order ID not found'
		}
#-----------Purchase Order Routes-----------------
@app.route('/api/order',methods=['POST'])
def saveNewOrder(): 
    data = request.get_json()
    recordID = random.randrange(12,10**6)
    writePurchaseOrder(data['purchaseOrderDetails'],data['itemOrderDetails']['specialRequests'],recordID,data['submitStatus'])
    return { 
        'status': 200,
        'msg':'OrderId '+str(recordID)+' created',
    }

@app.route('/api/order/<orderID>',methods=['PUT'])
def editParticularOrder(orderID):
    data = request.get_json()
    writePurchaseOrder(data['purchaseOrderDetails'],data['itemOrderDetails']['specialRequests'],orderID,data['submitStatus'])
    return { 
        'status': 200,
        'msg':'OrderId '+str(orderID)+' updated'
    }

@app.route('/api/order',methods=['GET'])
def getAllOrders():
    itemList = []
    itemOrderDataXML = u2py.run("LIST DATA PO.ORDER.MST ORDER.DATE VEND.NAME TOXML",capture=True)
    xmldata = itemOrderDataXML.strip()
    itemOrderDict = xmltodict.parse(xmldata)['ROOT']['PO.ORDER.MST']
    if type(itemOrderDict) is list:
        for item in itemOrderDict:
            tempDict = {}
            tempDict['purchaseOrderNo'] = item['@_ID']
            tempDict['orderDate'] = item['@ORDER.DATE']
            tempDict['companyName'] = item['@VEND.NAME']
            itemList.append(tempDict)
    else:
        tempDict = {}
        tempDict['purchaseOrderNo'] = itemOrderDict['@_ID']
        tempDict['orderDate'] = itemOrderDict['@ORDER.DATE']
        tempDict['companyName'] = itemOrderDict['@VEND.NAME']
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
        orderDetailsXML = u2py.run("LIST DATA PO.ORDER.MST "+orderID+" ORDER.DATE ORDER.STATUS COMP.NAME COMP.CONTACT.NAME COMP.ADDRESS COMP.PHONE ORDER.ITEM.IDS ORDER.ITEM.QTY ORDER.ITEM.COST VEND.NAME TOXML",capture=True)
        xmldata = orderDetailsXML.strip()
        orderDetail = xmltodict.parse(xmldata)['ROOT']['PO.ORDER.MST']
        orderDetailsDict = itemDict = {}
        itemList = []
        orderDetailsDict['orderDate'] = orderDetail['@ORDER.DATE']
        orderDetailsDict['companyName'] = orderDetail['@COMP.NAME']
        orderDetailsDict['phoneNumber'] = orderDetail['@COMP.PHONE']
        orderDetailsDict['contactName'] = orderDetail['@COMP.CONTACT.NAME']
        orderDetailsDict['vendorName'] = orderDetail['@VEND.NAME']

        orderDetailsDict['street'] = orderDetail['COMP.ADDRESS_MV'][0]['@COMP.ADDRESS']
        orderDetailsDict['city'] = orderDetail['COMP.ADDRESS_MV'][1]['@COMP.ADDRESS']
        orderDetailsDict['state'] = orderDetail['COMP.ADDRESS_MV'][2]['@COMP.ADDRESS']
        orderDetailsDict['zipCode'] = orderDetail['COMP.ADDRESS_MV'][3]['@COMP.ADDRESS']
        
        if(type(orderDetail['ORDER.ITEM.IDS_MV']) is list):   
            for i in range(len(orderDetail['ORDER.ITEM.IDS_MV'])):
                itemDict = {}
                itemDict['itemID'] = orderDetail['ORDER.ITEM.IDS_MV'][i]['@ORDER.ITEM.IDS']
                itemDict['cost'] = orderDetail['ORDER.ITEM.COST_MV'][i]['@ORDER.ITEM.COST']
                itemDict['quantity'] = orderDetail['ORDER.ITEM.QTY_MV'][i]['@ORDER.ITEM.QTY']
                itemList.append(itemDict)
        else:
            itemDict = {}
            itemDict['itemID'] = orderDetail['ORDER.ITEM.IDS_MV']['@ORDER.ITEM.IDS']
            itemDict['cost'] = orderDetail['ORDER.ITEM.COST_MV']['@ORDER.ITEM.COST']
            itemDict['quantity'] = orderDetail['ORDER.ITEM.QTY_MV']['@ORDER.ITEM.QTY']
            itemList.append(itemDict)
        return {
            'status': 200,
            'data': orderDetailsDict,
            'itemList': itemList,
            'submitStatus':orderDetail['@ORDER.STATUS']
        }
    else:
        return{
            'status':404,
            'msg': 'Order no not found'
        }

@app.route('/api/order/item/<itemID>',methods=['GET'])
def getvendorItemDetails(itemID):
    itemDescriptionXML = u2py.run("LIST PO.ITEM.MST WITH @ID = "+itemID+" DESC TOXML",capture=True)

    xmldata = itemDescriptionXML.strip()
    itemDescription = xmltodict.parse(xmldata)['ROOT']['PO.ITEM.MST']['@DESC']
    return {
        'status':200,
        'msg':'success',
        'data':itemDescription
    }
#-----------Purchase Order Routes-----------------

@app.route('/api/invoice/order/<orderId>',methods=['GET'])
def invoiceOrderDetails(orderId):
    status = checkExistingRecord('PO.ORDER.MST',orderId)
    if(status):
    	orderDetailsXML = u2py.run("LIST DATA PO.ORDER.MST "+orderId+" ORDER.ITEM.IDS ORDER.ITEM.QTY ORDER.ITEM.COST TOXML",capture=True)
    	xmldata = orderDetailsXML.strip()
    	# itemCost=itemIds=itemQuantity=data=[]
    	itemCost = []
    	itemQuantity  = []
    	itemIds = []
    	orderDict={}
    	orderDetail = xmltodict.parse(xmldata)['ROOT']['PO.ORDER.MST']
    	for i in range(len(orderDetail['ORDER.ITEM.COST_MV'])):
        	itemCost.append(orderDetail['ORDER.ITEM.COST_MV'][i]['@ORDER.ITEM.COST'])
    	for i in range(len(orderDetail['ORDER.ITEM.QTY_MV'])):
        	itemQuantity.append(orderDetail['ORDER.ITEM.QTY_MV'][i]['@ORDER.ITEM.QTY'])
    	for i in range(len(orderDetail['ORDER.ITEM.IDS_MV'])):
        	itemIds.append(orderDetail['ORDER.ITEM.IDS_MV'][i]['@ORDER.ITEM.IDS'])
    	return{
        	'status':200,
        	'cost':itemCost,
        	'quantity':itemQuantity,
        	"ids": itemIds,
        	"orderID":orderDetail['@_ID']
     		}
    else:
	    return{
		'status':404,
		'message':'OrderNo not found'
		}
@app.route('/api/invoice',methods=['GET'])
def allInvoice():
	cmd=u2py.run("LIST DATA PO.INVOICE.MST INV.DATE INV.ITEM.IDS INV.ITEM.QTY INV.ITEM.PENDING INV.ITEM.RECEIVED ORDER.NO INV.STATUS INV.AMT TOXML",capture=True)
	my_xml=cmd.strip()
	data = xmltodict.parse(my_xml)['ROOT']['PO.INVOICE.MST']
	invoice=[]
	invoiceData=[]
	if(type(data) is list):
		for i in data:
			invoice.append(i['@_ID'])
			invoice.append(i['@ORDER.NO'])
			invoice.append(i['@INV.AMT'])
			invoice.append(i['@INV.DATE'])
			invoiceData.append(invoice)
			invoice=[]
	else:
		invoice.append(data['@_ID'])
		invoice.append(data['@ORDER.NO'])
		invoice.append(data['@INV.AMT'])
		invoice.append(i['@INV.DATE'])
		invoiceData.append(invoice)
	return{'status':200,	
		'data':invoiceData
		}
@app.route('/api/invoice',methods=['POST'])
def invoiceCreate():
	data=request.get_json()
	saveInvoice(data['invoiceDetails']['orderNo'],data['invoiceDetails']['invoiceDetails'],data['invoiceDetails']['invoiceNo'],data['invoiceDetails']['invoiceDate'],data['invoiceDetails']['invoiceAmount'],data['submitStatus'])
	return{
        'status':200
    	}

@app.route('/api/invoice/<invoiceId>',methods=['GET'])
def particularInvoice(invoiceId):
	cmd=u2py.run("LIST DATA PO.INVOICE.MST " +invoiceId+ " INV.DATE INV.ITEM.IDS INV.ITEM.QTY INV.ITEM.PENDING INV.ITEM.RECEIVED ORDER.NO INV.STATUS INV.AMT TOXML",capture=True)
	invoiceNo=[]
	invoiceDate=[]
	orderNo=[]
	invoiceAmount=[]
	ids=[]
	quantity=[]
	invoiceStatus=[]
	quantityReceived = []
	my_xml=cmd.strip()
	data = xmltodict.parse(my_xml)['ROOT']['PO.INVOICE.MST']
	invoiceNo.append(data['@_ID'])
	invoiceDate.append(data['@INV.DATE'])
	orderNo.append(data['@ORDER.NO'])
	invoiceAmount.append(data['@INV.AMT'])
	invoiceStatus.append(data['@INV.STATUS'])
	if(type(data['INV.ITEM.IDS_MV'])is list):
		for i in range(len(data['INV.ITEM.IDS_MV'])):
			ids.append(data['INV.ITEM.IDS_MV'][i]['@INV.ITEM.IDS'])
			quantity.append(data['INV.ITEM.QTY_MV'][i]['@INV.ITEM.QTY'])
			quantityReceived.append(data['INV.ITEM.RECEIVED_MV'][i]['@INV.ITEM.RECEIVED'])
	else:
		ids.append(data['INV.ITEM.IDS_MV']['@INV.ITEM.IDS'])
		quantity.append(data['INV.ITEM.QTY_MV']['@INV.QTY.IDS'])
		quantityReceived.append(data['INV.ITEM.RECEIVED_MV']['@INV.ITEM.RECEIVED'])
	return{"status":200,
		"invoiceNo":invoiceNo,
		"invoiceDate":invoiceDate,
		"orderNo":orderNo,
		"ids":ids,
		"quantity":quantity,
		"invoiceStatus":invoiceStatus,
		"invoiceAmount":invoiceAmount,
		"quantityReceived":quantityReceived
		}
def saveInvoice(orderNo,invoiceDetails,invoiceNo,invoiceDate,invoiceAmount,status):
	invoiceData=u2py.DynArray()
	invoiceFile= u2py.File("PO.INVOICE.MST")
	itemNo=bytes("","utf-8")
	description=bytes("","utf-8")
	quantityOrdered=bytes("","utf-8")
	quantityPending=bytes("","utf-8")
	quantityReceived=bytes("","utf-8")
	for i in range(len(invoiceDetails)):
		itemNo=itemNo+bytes(invoiceDetails[i]['itemNo'],"utf-8")+u2py.VM
		quantityOrdered=quantityOrdered+bytes(invoiceDetails[i]['quantityOrdered'],"utf-8")+u2py.VM
		quantityPending=quantityPending+bytes(str(invoiceDetails[i]['quantityPending']),"utf-8")+u2py.VM
		quantityReceived=quantityReceived+bytes(invoiceDetails[i]['quantityReceived'],"utf-8")+u2py.VM
	invoiceData.insert(1,0,0,invoiceDate)
	invoiceData.insert(2,0,0,itemNo[:-1])
	invoiceData.insert(3,0,0,quantityOrdered[:-1])
	invoiceData.insert(4,0,0,quantityPending[:-1])
	invoiceData.insert(5,0,0,quantityReceived[:-1])
	invoiceData.insert(6,0,0,orderNo)
	invoiceData.insert(7,0,0,status)
	invoiceData.insert(8,0,0,invoiceAmount)
	invoiceFile.write(invoiceNo,invoiceData)

if __name__ == '__main__':
	app.run()
