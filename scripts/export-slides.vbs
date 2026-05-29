
Dim pptApp, pres, outDir
Set pptApp = CreateObject("PowerPoint.Application")
pptApp.Visible = True
Set pres = pptApp.Presentations.Open("" & WScript.Arguments(0) & "")
outDir = WScript.Arguments(1)
Dim i
For i = 1 To pres.Slides.Count
    pres.Slides(i).Export outDir & "slide-" & Right("00" & i, 2) & ".png", "PNG", 1280, 720
Next
pres.Close
pptApp.Quit
Set pres = Nothing
Set pptApp = Nothing
