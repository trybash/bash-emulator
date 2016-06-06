## Flow
- someone presses enter
- app sends command string to emulator
- emulator starts all commands
- app can listen to output events onOutput
- app can listen to file system change events


## features:

file system
history
readline
path
completion
pattern
killring
pipes
basic logic


## events:
output

## options:
path, filehandler

## methods:
input

## commands run in env:
stdin onInput, stdout, stderr,
dimensions,
clear screen,
position cursor,
arguments,
exit(code),
CWD (get/set),
file system: readLines, readDir, getStats (lastModified), createDir, write, remove,
history - optional in localStorage (using change events),
onClose

## commands

ls
ls dir
ls -a
ls -l

cd
cd dir
cd ~/dir
cd ..

pwd

history

cat .secret.txt
cat f1 f2
cat dir/*

clear

head

tail

mkdir

mv

cp

rm

touch

echo bla > file

;
>
>>>
<
&&
||

wc
wc -l
wc -c

sort

uniq

nl

tac

less