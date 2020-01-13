Declare Function deleteFileOperation As Integer

public function deleteFileOperation() As Integer

dim as integer file_num
dim as string iarray(9)
dim as string ptr ip = @iarray(0)
dim s as integer
dim i as integer = 0

s= Freefile
file_num = Freefile( )
Open "sample.txt" For Input As #1
dim str1 as String
Input "Enter the string you want to delete : " , str1
DO UNTIL EOF(file_num)
dim f as String
Input #1,f
iarray(i) = f
i = i + 1
LOOP
Close #1

Open "sample.txt" For Output As #1
for j as integer = 0 to i
	if iarray(j) <> str1 then
	write #1,iarray(j)
endif
next

Close #1
return 10

End Function

