from flask import Flask
from flask import request,jsonify
from flask import make_response
from functools import wraps
import u2py
import xmltodict
import pprint
import json
import random
import jwt
from datetime import datetime
from collections import OrderedDict
from flask_cors import CORS, cross_origin

app = Flask(__name__)
app.config['SECRET_KEY'] = 'thisisthesercretkey'
CORS(app)

import logging

logger = logging.getLogger()
formatter = logging.Formatter('%(asctime)s %(name)s %(levelname)s %(message)s')

console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(formatter)

file_handler = logging.FileHandler('./logs/api.log')
file_handler.setFormatter(formatter)

logger.setLevel(logging.DEBUG)
logger.addHandler(file_handler)
logger.addHandler(console_handler)

################################
## ITEMS API ###################
################################

@app.route('/api/item', methods=['GET'])
def allItems():
    command = "LIST DATA PO.ITEM.MST DESC TOXML"
    logger.debug(command)
    command_execute = u2py.run(command, capture=True)
    items_data_xml = command_execute.strip()
    items_data = xmltodict.parse(items_data_xml)['ROOT']['PO.ITEM.MST']
    items = json.loads(json.dumps(items_data))

    return {"data": items}, 200

################################
## VENDORS API #################
################################

@app.route('/api/vendor', methods=['GET'])
def vendorList():
    command = "LIST DATA PO.VENDOR.MST VEND.COMPANY VEND.NAME VEND.ADDRESS VEND.PHONE ITEM.IDS TOXML"
    logger.debug(command)
    command_execute = u2py.run(command, capture=True)
    vendors_data_xml = command_execute.strip()

    vendors_data = xmltodict.parse(vendors_data_xml)['ROOT']['PO.VENDOR.MST']
    vendors = json.loads(json.dumps(vendors_data))

    return {
        'status': 200,
        'data': vendors
    }

@app.route('/api/vendor', methods=['POST'])
def vendorCreate():
    vendorData = request.get_json()
    vendorId = random.randrange(12, 10 ** 6)
    itemIds = vendorData['itemIds']
    vendorDetails = vendorData['vendorDetail']

    upsertVendor(vendorDetails, itemIds, vendorId)
    return {
        'status': 200,
        'msg': "vendor " + str(vendorId) + " created",
    }


@app.route('/api/vendor/<vendorId>', methods=['PUT'])
def vendorUpdate(vendorId):
    vendorData = request.get_json()
    itemIds = vendorData['itemIds']
    vendorDetails = vendorData['vendorDetail']
    upsertVendor(vendorDetails, itemIds, vendorId)
    return {
        'status': 200,
        'msg': "vendor updated",
        'data': vendorData
    }

@app.route('/api/vendor/<vendorId>', methods=['GET'])
def vendorGet(vendorId):
    status = checkExistingRecord("PO.VENDOR.MST", vendorId)
    if (status):
        itemId = []
        itemDict = {}
        vendorDict = {}
        command = "LIST DATA PO.VENDOR.MST " + vendorId + " VEND.COMPANY VEND.NAME VEND.ADDRESS VEND.PHONE ITEM.IDS TOXML"
        logger.debug(command)
        command_execute = u2py.run(command, capture=True)
        my_xml = command_execute.strip()
        data = xmltodict.parse(my_xml)['ROOT']['PO.VENDOR.MST']
        if (type(data['ITEM.IDS_MV']) is list):
            for j in range(len(data['ITEM.IDS_MV'])):
                itemDict = {}
                itemDict['itemId'] = data['ITEM.IDS_MV'][j]['@ITEM.IDS']
                itemId.append(itemDict)
        else:
            itemDict['itemId'] = data['ITEM.IDS_MV']['@ITEM.IDS']
            itemId.append(itemDict)
        vendorDict['Company'] = data['@VEND.COMPANY']
        vendorDict['Contact'] = data['@VEND.NAME']
        vendorDict['Phone'] = data['@VEND.PHONE']
        vendorDict['Street'] = data['VEND.ADDRESS_MV'][0]['@VEND.ADDRESS']
        vendorDict['City'] = data['VEND.ADDRESS_MV'][1]['@VEND.ADDRESS']
        vendorDict['State'] = data['VEND.ADDRESS_MV'][2]['@VEND.ADDRESS']
        vendorDict['Zip'] = data['VEND.ADDRESS_MV'][3]['@VEND.ADDRESS']
        vendorData = {}
        vendorData['particularVendorData'] = vendorDict
        vendorData['itemIds'] = itemId

        return {
            'status': 200,
            'vendorData': vendorData
        }
    else:
        return {
            'status': 404,
            'msg': 'Vendor not found'
        }

################################
## PURCHASE ORDERS API #########
################################

@app.route('/api/order', methods=['GET'])
def purchaseOrderList():
    allOrders = request.args.get('allOrders')

    if allOrders is None:
        saveList_name = 'PAGE.LIST'
        pageIndex = int(request.args.get('pageIndex'))
        pageSize = int(request.args.get('pageSize'))
        orderNo = request.args.get('OrderNo')

        vendorName = request.args.get('VendorName')
        fromDate = request.args.get('FromDate')
        toDate = request.args.get('ToDate')

        start = pageIndex * pageSize + 1
        end = (pageIndex + 1) * pageSize
        lastOrder = False
        commandLine = filterPurchaseOrder(orderNo, vendorName, fromDate, toDate)
    else:
        start = 1
        saveList_name = 'TEMP.LIST'
        commandLine = 'SELECT {}'.format('PO.ORDER.MST')

    u2py.run(commandLine, capture=True)
    u2py.run('SAVE.LIST {}'.format(saveList_name))

    dataFile = u2py.File('PO.ORDER.MST')
    myList = u2py.List(0, saveList_name)
    t_id = myList.readlist()
    totalCount = t_id.dcount(u2py.FM)
    if allOrders is not None:
        end = totalCount - 1
    data = []
    for x in range(start, end + 1):
        if x > totalCount:
            lastOrder = True
            break
        id = t_id.extract(x)

        date = list(dataFile.readv(id, 1))[0][0]
        vendorName = list(dataFile.readv(id, 14))[0][0]
        id = list(id)[0][0]
        orderDict = mappingOrder(date, vendorName, id)
        data.append(orderDict)
    return {
        'status': 200,
        'data': data,
        'lastOrder': lastOrder,
        'totalCount': totalCount
    }

@app.route('/api/order', methods=['POST'])
def purchaseOrderCreate():
    data = request.get_json()
    newOrderId = random.randrange(12, 10 ** 6)
    upsertPurchaseOrder(data['details'], data['itemDetails'], newOrderId, data['status'])
    return {
        'status': 200,
        'msg': 'OrderId ' + str(newOrderId) + ' created'
    }

@app.route('/api/order/<orderId>', methods=['PUT'])
def purchaseOrderUpdate(orderId):
    data = request.get_json()
    upsertPurchaseOrder(data['details'], data['itemDetails'], orderId, data['status'])
    return {
        'status': 200,
        'msg': 'OrderId ' + str(orderId) + ' updated'
    }

@app.route('/api/order/<orderID>', methods=['GET'])
def purchaseOrderGet(orderID):
    status = checkExistingRecord('PO.ORDER.MST', orderID)
    if (status):
        command = "LIST DATA PO.ORDER.MST " + orderID + " ORDER.DATE ORDER.STATUS COMP.NAME COMP.CONTACT.NAME COMP.ADDRESS COMP.PHONE ORDER.ITEM.IDS ORDER.ITEM.QTY ORDER.ITEM.COST VEND.NAME TOXML"
        logger.debug(command)
        command_execute = u2py.run(command, capture=True)
        xmldata = command_execute.strip()
        orderDetail = xmltodict.parse(xmldata)['ROOT']['PO.ORDER.MST']
        orderDetailsDict = itemDict = {}
        itemList = []
        orderDetailsDict['OrderDate'] = orderDetail['@ORDER.DATE']
        orderDetailsDict['CompanyName'] = orderDetail['@COMP.NAME']
        orderDetailsDict['PhoneNumber'] = orderDetail['@COMP.PHONE']
        orderDetailsDict['ContactName'] = orderDetail['@COMP.CONTACT.NAME']
        orderDetailsDict['VendorName'] = orderDetail['@VEND.NAME']

        orderDetailsDict['Street'] = orderDetail['COMP.ADDRESS_MV'][0]['@COMP.ADDRESS']
        orderDetailsDict['City'] = orderDetail['COMP.ADDRESS_MV'][1]['@COMP.ADDRESS']
        orderDetailsDict['State'] = orderDetail['COMP.ADDRESS_MV'][2]['@COMP.ADDRESS']
        orderDetailsDict['ZipCode'] = orderDetail['COMP.ADDRESS_MV'][3]['@COMP.ADDRESS']

        if (type(orderDetail['ORDER.ITEM.IDS_MV']) is list):
            for i in range(len(orderDetail['ORDER.ITEM.IDS_MV'])):
                itemDict = {}
                itemDict['ItemID'] = orderDetail['ORDER.ITEM.IDS_MV'][i]['@ORDER.ITEM.IDS']
                itemDict['Cost'] = orderDetail['ORDER.ITEM.COST_MV'][i]['@ORDER.ITEM.COST']
                itemDict['Quantity'] = orderDetail['ORDER.ITEM.QTY_MV'][i]['@ORDER.ITEM.QTY']
                itemList.append(itemDict)
        else:
            itemDict = {}
            itemDict['ItemID'] = orderDetail['ORDER.ITEM.IDS_MV']['@ORDER.ITEM.IDS']
            itemDict['Cost'] = orderDetail['ORDER.ITEM.COST_MV']['@ORDER.ITEM.COST']
            itemDict['Quantity'] = orderDetail['ORDER.ITEM.QTY_MV']['@ORDER.ITEM.QTY']
            itemList.append(itemDict)
        orderDetails = {}
        orderDetails['orderData'] = orderDetailsDict
        orderDetails['itemList'] = itemList
        orderDetails['submitStatus'] = orderDetail['@ORDER.STATUS']

        return {
            'status': 200,
            'data': orderDetails
        }
    else:
        return {
            'status': 404,
            'msg': 'Order no not found'
        }

################################
## INVOICE API #################
################################

@app.route('/api/invoices', methods=['GET'])
def invoiceList():
    invoiceNo = request.args.get('invoiceNo')
    invoiceFromDate = request.args.get('invoiceFromDate')
    invoiceToDate = request.args.get('invoiceToDate')
    orderNo = request.args.get('orderNo')

    invoice_No = order_No = date_from = date_to = ""
    if invoiceNo and invoiceNo != 'null':
        invoice_No = ' WITH @ID = "' + str(invoiceNo) + '"'
    if orderNo and orderNo != 'null':
        order_No = ' WITH ORDER.NO = "' + str(orderNo) + '"'
    if invoiceFromDate and invoiceFromDate != 'null':
        date_from = ' WITH INV.DATE GE "' + str(invoiceFromDate) + '"'
    if invoiceToDate and invoiceToDate != 'null':
        date_to = ' WITH INV.DATE LE "' + str(invoiceToDate) + '"'
    command = "LIST DATA ORDER.NO INV.AMT PO.INVOICE.MST{}{}{}{} TOXML".format(invoice_No, order_No, date_from, date_to)
    logger.debug(command)
    command_execute = u2py.run(command, capture=True)
    data = command_execute.strip()
    invoices_data = xmltodict.parse(data)['ROOT']
    if invoices_data is not None:
        invoices = json.loads(json.dumps(invoices_data['PO.INVOICE.MST']))
    else:
        invoices = []
    if type(invoices) is not list :
        invoiceList = []
        invoiceList.append(invoices)
        invoices = invoiceList
    return {
        'status': 200,
        'data': invoices
    }

@app.route('/api/invoice', methods=['POST'])
def invoiceCreate():
    data = request.get_json()
    upsertInvoice(data['invoiceDetails']['orderNo'], data['invoiceDetails']['invoiceDetails'],
                data['invoiceDetails']['invoiceNo'], data['invoiceDetails']['invoiceDate'],
                data['invoiceDetails']['invoiceAmount'], data['submitStatus'])
    return {
        'status': 200,
        'msg': 'Invoice {} generated'.format(data['invoiceDetails']['invoiceNo'])
    }


@app.route('/api/invoice/<invoiceId>', methods=['GET'])
def invoiceGet(invoiceId):
    command = "LIST DATA PO.INVOICE.MST " + invoiceId + " INV.DATE INV.ITEM.IDS INV.ITEM.QTY INV.ITEM.PENDING INV.ITEM.RECEIVED ORDER.NO INV.STATUS INV.AMT TOXML"
    logger.debug(command)
    command_execute = u2py.run(command, capture=True)
    invoiceNo = []
    invoiceDate = []
    orderNo = []
    invoiceAmount = []
    ids = []
    quantity = []
    invoiceStatus = []
    quantityReceived = []
    my_xml = command_execute.strip()
    data = xmltodict.parse(my_xml)['ROOT']['PO.INVOICE.MST']
    invoiceNo.append(data['@_ID'])
    invoiceDate.append(data['@INV.DATE'])
    orderNo.append(data['@ORDER.NO'])
    invoiceAmount.append(data['@INV.AMT'])
    invoiceStatus.append(data['@INV.STATUS'])
    if (type(data['INV.ITEM.IDS_MV']) is list):
        for i in range(len(data['INV.ITEM.IDS_MV'])):
            ids.append(data['INV.ITEM.IDS_MV'][i]['@INV.ITEM.IDS'])
            quantity.append(data['INV.ITEM.QTY_MV'][i]['@INV.ITEM.QTY'])
            quantityReceived.append(data['INV.ITEM.RECEIVED_MV'][i]['@INV.ITEM.RECEIVED'])
    else:
        ids.append(data['INV.ITEM.IDS_MV']['@INV.ITEM.IDS'])
        quantity.append(data['INV.ITEM.QTY_MV']['@INV.QTY.IDS'])
        quantityReceived.append(data['INV.ITEM.RECEIVED_MV']['@INV.ITEM.RECEIVED'])
    return {
        "status": 200,
        "invoiceNo": invoiceNo,
        "invoiceDate": invoiceDate,
        "orderNo": orderNo,
        "ids": ids,
        "quantity": quantity,
        "invoiceStatus": invoiceStatus,
        "invoiceAmount": invoiceAmount,
        "quantityReceived": quantityReceived
    }

@app.route('/api/invoice/order/<orderId>', methods=['GET'])
def invoicePurchaseOrderItemsGet(orderId):
    status = checkExistingRecord('PO.ORDER.MST', orderId)
    if (status):
        command = "LIST DATA PO.ORDER.MST " + orderId + " ORDER.ITEM.IDS ORDER.ITEM.QTY ORDER.ITEM.COST TOXML"
        logger.debug(command)
        command_execute = u2py.run(command, capture=True)
        xmldata = command_execute.strip()
        itemCost = []
        itemQuantity = []
        itemIds = []
        orderDetail = xmltodict.parse(xmldata)['ROOT']['PO.ORDER.MST']
        if (type(orderDetail['ORDER.ITEM.COST_MV']) is list):
            for i in range(len(orderDetail['ORDER.ITEM.COST_MV'])):
                itemCost.append(orderDetail['ORDER.ITEM.COST_MV'][i]['@ORDER.ITEM.COST'])
            for i in range(len(orderDetail['ORDER.ITEM.QTY_MV'])):
                itemQuantity.append(orderDetail['ORDER.ITEM.QTY_MV'][i]['@ORDER.ITEM.QTY'])
            for i in range(len(orderDetail['ORDER.ITEM.IDS_MV'])):
                itemIds.append(orderDetail['ORDER.ITEM.IDS_MV'][i]['@ORDER.ITEM.IDS'])
        else:
            itemCost.append(orderDetail['ORDER.ITEM.COST_MV']['@ORDER.ITEM.COST'])
            itemIds.append(orderDetail['ORDER.ITEM.IDS_MV']['@ORDER.ITEM.IDS'])
            itemQuantity.append(orderDetail['ORDER.ITEM.QTY_MV']['@ORDER.ITEM.QTY'])
        return {
            'status': 200,
            'cost': itemCost,
            'quantity': itemQuantity,
            "ids": itemIds,
            "orderID": orderDetail['@_ID']
        }
    else:
        return {
            'status': 404,
            'message': 'OrderNo not found'
        }

################################
## LOGIN API ###################
################################

@app.route('/login', methods=['POST'])
def login():
    auth = request.get_json()
    print(auth['loginDetails'])
    username = auth['loginDetails']['username']
    password = auth['loginDetails']['password']
    if (checkuser(username, password)):
        token = jwt.encode({'username': username, 'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=30)},
                           app.config['SECRET_KEY'])
        return {
            'status': 200,
            'token': token.decode('UTF-8')
        }
    return make_response('Could not verify!', 401)


################################
## HELPER METHODS ##############
################################

def checkExistingRecord(filename, recordID):
    fileObject = u2py.File(filename)
    try:
        recordObject = fileObject.read(recordID)
        return True
    except u2py.U2Error as e:
        return False

def upsertVendor(details, itemIds, recordID):
    address = [details['Street'], details['City'], details['State'], details['Zip']]
    data = [details['Company'], details['Contact'], address, details['Phone'], itemIds]
    vendorFile = u2py.File('PO.VENDOR.MST')
    vendorFile.write(recordID, u2py.DynArray(data))


def upsertPurchaseOrder(details, itemDetails, recordID, status):
    orderDate = datetime.strptime(details['OrderDate'], "%Y-%m-%d").strftime("%m-%d-%Y")
    formattedDate = convertDateFormat(orderDate)
    address = [details['Street'], details['City'], details['State'], details['ZipCode']]
    itemIds = []
    quantities = []
    costs = []
    for itemDetail in itemDetails:
        itemIds.append(itemDetail['ItemID'])
        quantities.append(itemDetail['Quantity'])
        costs.append(itemDetail['UnitCost'])
    data = [formattedDate, status, "", "", "", "", details['CompanyName'], details['ContactName'], address, details['PhoneNumber'], itemIds, quantities, costs, details['VendorName']]
    orderFile = u2py.File("PO.ORDER.MST")
    orderFile.write(recordID, u2py.DynArray(data))

def upsertInvoice(orderNo, invoiceDetails, invoiceNo, invoiceDate, invoiceAmount, status):
    invoiceData = u2py.DynArray()
    invoiceFile = u2py.File("PO.INVOICE.MST")
    itemNo = bytes("", "utf-8")
    description = bytes("", "utf-8")
    quantityOrdered = bytes("", "utf-8")
    quantityPending = bytes("", "utf-8")
    quantityReceived = bytes("", "utf-8")
    for i in range(len(invoiceDetails)):
        itemNo = itemNo + bytes(invoiceDetails[i]['itemNo'], "utf-8") + u2py.VM
        quantityOrdered = quantityOrdered + bytes(invoiceDetails[i]['quantityOrdered'], "utf-8") + u2py.VM
        quantityPending = quantityPending + bytes(str(invoiceDetails[i]['quantityPending']), "utf-8") + u2py.VM
        quantityReceived = quantityReceived + bytes(invoiceDetails[i]['quantityReceived'], "utf-8") + u2py.VM
    invoiceData.insert(1, 0, 0, invoiceDate)
    invoiceData.insert(2, 0, 0, itemNo[:-1])
    invoiceData.insert(3, 0, 0, quantityOrdered[:-1])
    invoiceData.insert(4, 0, 0, quantityPending[:-1])
    invoiceData.insert(5, 0, 0, quantityReceived[:-1])
    invoiceData.insert(6, 0, 0, orderNo)
    invoiceData.insert(7, 0, 0, status)
    invoiceData.insert(8, 0, 0, invoiceAmount)
    invoiceFile.write(invoiceNo, invoiceData)

def checkuser(username, password):
    users = {"user1": "abc", "user2": "xyz", "user3": "123"}
    for keys in users.keys():
        if (keys == username):
            if (users[username] == password):
                return 'True'
            else:
                return 'False'
        else:
            return 'False'

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        print(token)
        if not token:
            print("")
            return {"msg": "Token is missing"
                    }, 403
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'])
            return data
        except:
            return {'msg': 'Token is invalid'}, 403

    return decorated

def filterPurchaseOrder(orderNo, vendorName, fromDate, toDate):
    order_No = vendor_Name = from_Date = to_Date = ""
    if orderNo and orderNo != 'null':
        order_No = ' WITH @ID = "' + str(orderNo) + '"'
    if vendorName and vendorName != 'null':
        vendor_Name = ' AND WITH VEND.NAME = "' + vendorName + '"'
    if fromDate and fromDate != 'null':
        from_Date = ' AND WITH ORDER.DATE GE "' + str(fromDate) + '"'
    if toDate and toDate != 'null':
        to_Date = ' AND WITH ORDER.DATE LE "' + str(toDate) + '"'

    if not orderNo and not vendorName and not fromDate and not toDate:
        commandLine = 'SELECT {}'.format('PO.ORDER.MST')
    else:
        commandLine = 'SELECT {} {} {} {} {}'.format('PO.ORDER.MST', order_No, vendor_Name, from_Date, to_Date)

    return commandLine

def mappingOrder(date,vendorName,id):
    orderDict = {}
    orderDict['date'] = date
    orderDict['vendorName'] = vendorName
    orderDict['id'] = id
    return orderDict

def convertDateFormat(orderDate):
    date = u2py.DynArray()
    date.insert(1, 0, 0, orderDate)
    formattedDate = date.extract(1).iconv('D-')
    return formattedDate


def changeDateFormat(orderDate):
    date = u2py.DynArray()
    date.insert(1, 0, 0, orderDate)
    formattedDate = str(date.extract(1).oconv('D-'))
    return formattedDate


if __name__ == '__main__':
    app.run()
