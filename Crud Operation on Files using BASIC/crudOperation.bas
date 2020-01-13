#include "readFile.bas"
#include "writeFile.bas"
#include "updateFile.bas"
#include "deleteFile.bas"

Extern import readFile As Integer
Extern import writeFile As Integer
Extern import updateFile As Integer
Extern import deleteFile As Integer

dim num as Integer

print !"Enter 1 for adding data,\n      2 for reading data,\n      3 for updating data,\n      4 for removing data and\n0 to quit : "
input num
do while num <> 0
cls
if num = 0 then
end

elseif num = 1 then
writeFileOperation

elseif num = 2 then
readFileOperation

elseif num = 3 then
updateFileOperation

elseif num = 4 then
deleteFileOperation

end if

print !"Enter 1 for adding data,\n      2 for reading data,\n      3 for updating data,\n      4 for removing data and\n0 to quit : "
input num

loop

