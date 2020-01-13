from flask import Flask
import pandas as pd
from pandas import ExcelWriter
from pandas import ExcelFile
import u2py
import xlrd
import xlwt
from xlwt import Workbook 
app = Flask(__name__)
@app.route('/')
def mainPage():
	return "Hello"
@app.route('/read')
def readFromExcel():
		for i in range(1,4):
			loc = ("/usr/uv/PANDA/Employees.xlsx")
			b=str;
			wb = xlrd.open_workbook(loc)
			sheet = wb.sheet_by_index(0)
			sheet.cell_value(0, 0)
			f=u2py.File("EXCELPANDA")
			b=(sheet.cell_value(i,1));
			f.write("NAME",b)
			#f.read("ONE")
			#print(sheet)
			print(b)
			#print(i)
		return "Data inserted into UniVerse from Excel File"

@app.route('/write')
def writeToExcel():
	excel_file = "/usr/uv/PANDA/experiment.xlsx"
	f = u2py.File("EXCELPANDA")
	r = f.read("NAME")
	print(type(r))
	print(r)
	df= pd.DataFrame({'NAME':r})
	writer = ExcelWriter(excel_file, engine='xlsxwriter')
	df.to_excel(writer,sheet_name='Sheet 1')
	writer.save()
	return "Successfully written to excel file from UniVerse" 

if __name__ == '__main__':
	app.run()
