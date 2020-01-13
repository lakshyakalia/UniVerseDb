import pandas as pd
import u2py
import xlrd
def helloworld():
	loc = ("/usr/uv/PANDA/Employees.xlsx")
	wb = xlrd.open_workbook(loc) 
	sheet = wb.sheet_by_index(0) 
	sheet.cell_value(0, 0) 
	length=(sheet.nrows)
	for i in range(1,length):
		f=u2py.File("UBER")
		b=str;	
		b=(sheet.cell_value(i,1));
		f.write("NAME",b)
		print(b)
	f.close()
helloworld()
