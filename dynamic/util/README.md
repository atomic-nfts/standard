# Utility Folder
Making an animated dynamic NFT that works in an iframe can be a bit tricky. The approach used in this project is to break up a .gif into component frame files. 

This can be accomplished using the imagemagick library like so:
`convert animation.gif target.png` 

Once the .gif has been broken into frames, you can convert each png to an SVG using a library like this: https://www.pngtosvg.com/

After all images have been converted to SVG, you can put them in the `svg/` folder of this repository and then run `node createSVGArray.js` to compile a JSON array of the visual elements for your dynamic NFT.
