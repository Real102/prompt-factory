param([Parameter(ValueFromRemainingArguments=$true)][string[]]$Args)
$env:PATH = "C:\Users\宇飞\.cargo\bin;" + $env:PATH
$cmd = $Args -join " "
Invoke-Expression $cmd
