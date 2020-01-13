Declare Function readFileOperation As Integer

Public Function readFileOperation() As Integer
dim as integer file_num
dim s as integer
s= Freefile
file_num = Freefile( )
Open "sample.txt" For Input As #1
DO UNTIL EOF(file_num)
dim f as String
Input #1,f
Print f
LOOP
Close #1
return 10
End Function


