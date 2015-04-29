# xbm
This repository represents initial attempts at parsing an XMB image file for automatic inline replacement within Google Chrome. This work is incomplete and has been temporarily abandoned due to the original impetus being a means of procastination during Final Week.

The idea came about in attempting to render one of the older preserved web pages from Stanford in a web browser. The web page included an XBM image file ( https://swap.stanford.edu/19930502000000im_/http://slacvm.slac.stanford.edu/FIND/slac.xbm ) as a logo. Modern web browsers, including Google Chrome, no longer support this format.

The state of the work is that the hex bits are attempted to be parsed out and displayed to console. slac.png represents the ideal output, as generated with ImageMagick (`convert slac.xbm slac.png`).

The contents of this repository can be loaded into a local copy of Google Chrome through the extensions tab in the settings, edited, and debugged. I hope to one day get the code working but in the mean time, please feel free to take a stab at it and submit a pull request.
